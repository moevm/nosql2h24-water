from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, UUID4
from typing import List, Optional
from neo4j import GraphDatabase

import uvicorn
import os
from datetime import datetime, timezone
import uuid

app = FastAPI()

# Neo4j database credentials
NEO4J_URI = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
NEO4J_USER = os.getenv('NEO4J_USER', 'neo4j')
NEO4J_PASSWORD = os.getenv('NEO4J_PASSWORD', 'neo4j')

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


class Lake(BaseModel):
    id: str
    name: str
    description: str
    coordinates_boundary: dict
    availability_score: float
    max_depth: float
    inflowing_rivers: List[str]
    outflowing_rivers: List[str]
    salinity: float


# Helper function to execute Neo4j queries
def run_query(cypher_query, parameters=None):
    with driver.session() as session:
        return session.run(cypher_query, parameters)


class User(BaseModel):
    id: UUID4
    name: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime
    avatar_url: str


class NewUserRequest(BaseModel):
    name: str
    email: str


@app.post("/users/new", response_model=str)
def create_user(user_request: NewUserRequest) -> str:
    timestamp = datetime.now(timezone.utc)

    user = User(
        id=uuid.uuid4(),
        name=user_request.name,
        email=user_request.email,
        created_at=timestamp,
        updated_at=timestamp,
        avatar_url="",  # TODO: Handle user icons
    )

    query = """
       CREATE (u:User {
           id: $id,
           name: $name,
           email: $email,
           created_at: datetime($created_at),
           updated_at: datetime($updated_at),
           avatar_url: $avatar_url
       })
       RETURN u
       """

    user_prepared = user.dict()
    user_prepared["id"] = user.id.hex

    result = None
    with driver.session() as session:
        result = session.run(query, user_prepared).single()

    if result is None:
        raise HTTPException(status_code=500, detail="Failed to create user")

    return result['u']['id']


@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: UUID4) -> User:
    query = """
    MATCH (u:User {id: $user_id})
    RETURN u
    """

    result = None
    with driver.session() as session:
        result = session \
                .run(query, {"user_id": user_id.hex}) \
                .single()

    if result is None:
        raise HTTPException(404, "User not found")

    return User(
        id=UUID4(result[id]),
        name=result['name'],
        email=result['email'],
        created_at=result['created_at'].to_native(),
        updated_at=result['updated_at'].to_native(),
        avatar_url=result['avatar_url'],
    )


@app.get("/users", response_model=List[User])
def list_users() -> List[User]:
    query = """
    MATCH (u:User)
    RETURN u
    """

    users = []
    with driver.session() as session:
        for record in session.run(query):
            data = record['u']

            user = User(
                id=UUID4(data['id']),
                name=data['name'],
                email=data['email'],
                created_at=data['created_at'].to_native(),
                updated_at=data['updated_at'].to_native(),
                avatar_url=data['avatar_url'],
            )

            users.append(user)

    return users


class Point(BaseModel):
    id: UUID4
    coordinates: dict
    description: str
    availability: float


class CreatePointRequest(BaseModel):
    coordinates: dict
    description: str
    availability: float


@app.post("/points/new", response_model=str)
def create_point(req: CreatePointRequest) -> str:
    point = Point(
        id=uuid.uuid4(),
        coordinates=req.coordinates,
        description=req.description,
        availability=req.availability,
    )

    query = """
       CREATE (p:Point {
           id: $id,
           coordinates: point({latitude: $lat, longitude: $lon}),
           description: $description,
           availability: $availability
       })
       RETURN p
       """

    point_prepared = point.dict()
    point_prepared["id"] = point.id.hex
    point_prepared["lat"] = point.coordinates["coordinates"][0]
    point_prepared["lon"] = point.coordinates["coordinates"][1]

    with driver.session() as session:
        data = session.run(query, point_prepared).single()

    if not data:
        raise HTTPException(status_code=500, detail="Failed to create point")

    return data['p']['id']


@app.get("/points/{point_id}", response_model=Point)
def get_point(point_id: UUID4) -> Point:
    query = """
    MATCH (p:Point {id: $point_id})
    RETURN p
    """

    with driver.session() as session:
        data = session \
                .run(query, {"point_id": point_id.hex}) \
                .single()['p']

    if not data:
        raise HTTPException(status_code=404, detail="Failed to find point")

    return Point(
        id=UUID4(data['id']),
        coordinates={
            "type": "Point",
            "coordinates": [
                data['coordinates'][0],
                data['coordinates'][1],
            ],
        },
        description=data['description'],
        availability=float(data['availability']),
    )


@app.get("/points", response_model=List[Point])
def list_points() -> List[Point]:
    query = """
    MATCH (p:Point)
    RETURN p
    """

    points = []
    with driver.session() as session:
        for record in session.run(query):
            data = record['p']

            point = Point(
                id=UUID4(data['id']),
                coordinates={
                    "type":
                    "Point",
                    "coordinates": [
                        data['coordinates'][0],
                        data['coordinates'][1],
                    ],
                },
                description=data['description'],
                availability=float(data['availability']),
            )

            points.append(point)

    return points


class Route(BaseModel):
    id: UUID4
    point_ids: List[UUID4]
    author_id: UUID4
    popularity_score: float


class CreateRouteRequest(BaseModel):
    point_ids: List[UUID4]
    author: UUID4
    popularity_score: float


@app.post("/routes/new", response_model=UUID4)
def create_route(req: CreateRouteRequest) -> UUID4:
    route = Route(
        id=uuid.uuid4(),
        point_ids=req.point_ids,
        author_id=req.author,
        popularity_score=req.popularity_score,
    )

    query = """
MATCH (a:User {id: $author_id})
WITH a
WHERE a IS NOT NULL

UNWIND $point_ids AS pid
MATCH (p:Point {id: pid})
WITH a, collect(p) AS points
WHERE size(points) = size($point_ids)

CREATE (r:Route {id: $id, popularity_score: $popularity_score})
CREATE (r)-[:CREATED_BY]->(a)
FOREACH (point IN points | CREATE (r)-[:HAS_POINT]->(point))
RETURN r
       """

    route_prepared = route.dict()
    route_prepared['id'] = route.id.hex
    route_prepared['author_id'] = route.author_id.hex
    route_prepared['point_ids'] = \
        [point_id.hex for point_id in route.point_ids]

    data = None
    with driver.session() as session:
        data = session.run(query, route_prepared).single()

    if data is None:
        raise HTTPException(status_code=500, detail="Internal error")

    return UUID4(data['r']['id'])


@app.get("/routes/{route_id}", response_model=Route)
def get_route(route_id: UUID4) -> Route:
    query = """
    MATCH (r:Route {id: $route_id})
    OPTIONAL MATCH (r)-[:HAS_POINT]->(p:Point)
    OPTIONAL MATCH (r)-[:CREATED_BY]->(u:User)
    RETURN r, collect(p.id) as points, u.id as author_id
    """

    with driver.session() as session:
        data = session.run(query, {"route_id": route_id.hex}).single()

    if not data or data.get('r') is None:
        raise HTTPException(status_code=404, detail="Not found")

    route = data['r']
    points = data['points']

    return Route(
        id=UUID4(route['id']),
        author_id=UUID4(data['author_id']),
        point_ids=[UUID4(point_id) for point_id in points['point_ids']],
        popularity_score=float(route['popularity_score']),
    )


@app.get("/routes", response_model=List[Route])
def list_routes() -> List[Route]:
    query = """
    MATCH (r:Route)
    OPTIONAL MATCH (r)-[:HAS_POINT]->(p:Point)
    OPTIONAL MATCH (r)-[:CREATED_BY]->(u:User)
    WITH r, collect(p.id) as points, u.id as author_id
    RETURN r, points, author_id
    """

    routes: List[Route] = []
    with driver.session() as session:
        for record in session.run(query):
            route = record['r']
            points = record['points']
            author = record['author_id']

            routes.append(
                Route(
                    id=UUID4(route['id']),
                    author_id=UUID4(author),
                    point_ids=[UUID4(point) for point in points],
                    popularity_score=float(route['popularity_score']),
                ))

    if len(routes) == 0:
        raise HTTPException(status_code=404, detail="No routes found")

    return routes


@app.get("/lakes/{lake_id}", response_model=Lake)
def get_lake(lake_id: str):
    query = """
    MATCH (l:Lake {id: $lake_id})
    RETURN l
    """
    result = run_query(query, {"lake_id": lake_id})
    if result:
        lake = result[0]['l']
        return Lake(**lake)
    return {}


@app.get("/lakes", response_model=List[Lake])
def list_lakes():
    query = """
    MATCH (l:Lake)
    RETURN l
    """
    result = run_query(query)
    lakes = [Lake(**record['l']) for record in result]
    return lakes


class SupportTicket(BaseModel):
    id: UUID4
    author_id: UUID4
    subject: str
    text: str
    created_at: datetime
    route_reference: Optional[UUID4] = None
    lake_reference: Optional[UUID4] = None


class CreateSupportTicketRequest(BaseModel):
    id: UUID4
    author_id: UUID4
    subject: str
    text: str
    created_at: datetime
    route_reference: Optional[UUID4] = None
    lake_reference: Optional[UUID4] = None


@app.post("/support-tickets/new", response_model=UUID4)
def create_support_request(req: CreateSupportTicketRequest) -> UUID4:
    pass


@app.get("/support-tickets/{ticket_id}", response_model=SupportTicket)
def get_support_request(ticket_id: UUID4) -> SupportTicket:
    query = """
    MATCH (s:SupportRequest {id: $request_id})
    OPTIONAL MATCH (s)-[:HAS_REVIEW]->(r:Review)
    RETURN s, collect(r) as reviews
    """
    result = run_query(query, {"request_id": ticket_id})
    if result:
        support_request = result[0]['s']
        return SupportTicket(**support_request)
    return {}


@app.get("/support-tickets", response_model=List[SupportTicket])
def list_support_requests() -> SupportTicket:
    query = """
    MATCH (s:SupportRequest)
    OPTIONAL MATCH (s)-[:HAS_REVIEW]->(r:Review)
    WITH s, collect(r) as reviews
    RETURN s, reviews
    """
    result = run_query(query)
    support_requests = []
    for record in result:
        support_request = record['s']
        support_requests.append(SupportTicket(**support_request))
    return support_requests


@app.post("/lakes/new", response_model=Lake)
def create_lake(lake: Lake):
    query = """
       CREATE (l:Lake {
           id: $id,
           name: $name,
           description: $description,
           coordinates_boundary: $coordinates_boundary,
           availability_score: $availability_score,
           max_depth: $max_depth,
           inflowing_rivers: $inflowing_rivers,
           outflowing_rivers: $outflowing_rivers,
           salinity: $salinity
       })
       RETURN l
       """
    result = run_query(query, lake.dict())
    if result:
        lake_data = result[0]['l']
        return Lake(**lake_data)
    else:
        raise HTTPException(status_code=500, detail="Failed to create lake")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
