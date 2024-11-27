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

    return routes


class Lake(BaseModel):
    id: UUID4
    name: str
    description: str
    coordinates_boundary: dict
    availability_score: float
    max_depth: float
    salinity: float
    inflowing_rivers: List[str]
    outflowing_rivers: List[str]


class CreateLakeRequest(BaseModel):
    name: str
    description: str
    coordinates_boundary: dict
    availability: float
    max_depth: float
    salinity: float
    inflowing_rivers: List[str]
    outflowing_rivers: List[str]


@app.post("/lakes/new", response_model=UUID4)
def create_lake(req: CreateLakeRequest) -> UUID4:
    lake = Lake(
        id=uuid.uuid4(),
        name=req.name,
        description=req.description,
        coordinates_boundary=req.coordinates_boundary,
        availability_score=req.availability,
        max_depth=req.max_depth,
        salinity=req.salinity,
        inflowing_rivers=req.inflowing_rivers,
        outflowing_rivers=req.outflowing_rivers,
    )

    query = """
CREATE (l:Lake {
    id: $id,
    name: $name,
    description: $description,
    coordinates_boundary: [c IN $coordinates_boundary | point({
        longitude: c.lon,
        latitude: c.lat
    })],
    availability_score: $availability_score,
    max_depth: $max_depth,
    inflowing_rivers: $inflowing_rivers,
    outflowing_rivers: $outflowing_rivers,
    salinity: $salinity
})
RETURN l
       """

    lake_prepared = lake.dict()
    lake_prepared['id'] = lake.id.hex
    lake_prepared['coordinates_boundary'] = \
        [{"lon": point[0], "lat": point[1]}
            for point in lake.coordinates_boundary['coordinates'][0]]

    result = None
    with driver.session() as session:
        result = session.run(query, lake_prepared).single()

    if result is None:
        raise HTTPException(status_code=500, detail="Failed to create lake")

    return UUID4(result['l']['id'])


@app.get("/lakes/{lake_id}", response_model=Lake)
def get_lake(lake_id: UUID4) -> Lake:
    query = """
    MATCH (l:Lake {id: $lake_id})
    RETURN l
    """

    result = None
    with driver.session() as session:
        result = session.run(query, {"lake_id": lake_id.hex}).single()

    if result is None:
        raise HTTPException(status_code=404, detail="Lake not found")

    lake = result['l']
    return Lake(
        id=lake['id'],
        name=lake['name'],
        description=lake['description'],
        coordinates_boundary={
            "type":
            "Polygon",
            "coordinates":
            [[(point[0], point[1]) for point in lake['coordinates_boundary']]],
        },
        availability_score=float(lake['availability_score']),
        max_depth=float(lake['max_depth']),
        salinity=float(lake['salinity']),
        inflowing_rivers=list(lake['inflowing_rivers']),
        outflowing_rivers=list(lake['outflowing_rivers']),
    )


@app.get("/lakes", response_model=List[Lake])
def list_lakes() -> List[Lake]:
    query = """
    MATCH (l:Lake)
    RETURN l
    """

    lakes: List[Lake] = []
    with driver.session() as session:
        for record in session.run(query):
            lake = record['l']

            lakes.append(
                Lake(
                    id=lake['id'],
                    name=lake['name'],
                    description=lake['description'],
                    coordinates_boundary={
                        "type":
                        "Polygon",
                        "coordinates":
                        [(point[0], point[1])
                         for point in lake['coordinates_boundary']],
                    },
                    availability_score=float(lake['availability_score']),
                    max_depth=float(lake['max_depth']),
                    salinity=float(lake['salinity']),
                    inflowing_rivers=list(lake['inflowing_rivers']),
                    outflowing_rivers=list(lake['outflowing_rivers']),
                ))

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
    author_id: UUID4
    subject: str
    text: str
    route_reference: Optional[UUID4] = None
    lake_reference: Optional[UUID4] = None


@app.post("/support-tickets/new", response_model=UUID4)
def create_support_ticket(req: CreateSupportTicketRequest) -> UUID4:
    query = """
MATCH (author:User {id: $author_id})
CREATE (ticket:SupportTicket {
    id: randomUUID(),
    subject: $subject,
    text: $text,
    created_at: datetime($created_at)
})
CREATE (ticket)-[:CREATED_BY]->(author)
WITH ticket
OPTIONAL MATCH (route:Route {id: $route_reference})
FOREACH (_ IN CASE WHEN route IS NULL THEN [] ELSE [1] END |
    CREATE (ticket)-[:REFERENCED_BY]->(route))
WITH ticket
OPTIONAL MATCH (lake:Lake {id: $lake_reference})
FOREACH (_ IN CASE WHEN lake IS NULL THEN [] ELSE [1] END |
    CREATE (ticket)-[:REFERENCED_BY]->(lake))
RETURN ticket AS t
    """

    ticket_prepared = req.dict()
    ticket_prepared['author_id'] = req.author_id.hex
    ticket_prepared['created_at'] = datetime.now(timezone.utc)

    data = None
    with driver.session() as session:
        data = session.run(query, ticket_prepared).single()

    if data is None:
        raise HTTPException(status_code=500, detail="Failed to create ticket")

    return data['t']['id']


@app.get("/support-tickets/{ticket_id}", response_model=SupportTicket)
def get_support_ticket(ticket_id: UUID4) -> SupportTicket:
    query = """
MATCH (ticket:SupportTicket {id: $ticket_id})
OPTIONAL MATCH (ticket)-[:CREATED_BY]->(author:User)
OPTIONAL MATCH (ticket)-[:REFERENCED_BY]->(route:Route)
OPTIONAL MATCH (ticket)-[:REFERENCED_BY]->(lake:Lake)
RETURN
  ticket.id AS id,
  author.id AS author_id,
  ticket.subject AS subject,
  ticket.text AS text,
  ticket.created_at AS created_at,
  route.id AS route_reference,
  lake.id AS lake_reference
    """

    data = None
    with driver.session() as session:
        data = session.run(query, {"ticket_id": ticket_id.hex}).single()

    if data is None:
        raise HTTPException(status_code=404, detail="Failed to find ticket")

    return SupportTicket(
        id=UUID4(data['id']),
        author_id=data['author_id'],
        subject=data['subject'],
        text=data['text'],
        created_at=data['created_at'].to_native(),
        route_reference=data.get('route_reference'),
        lake_reference=data.get('lake_reference'),
    )


@app.get("/support-tickets", response_model=List[SupportTicket])
def list_support_tickets() -> SupportTicket:
    query = """
MATCH (ticket:SupportTicket)
OPTIONAL MATCH (ticket)-[:CREATED_BY]->(author:User)
OPTIONAL MATCH (ticket)-[:REFERENCED_BY]->(route:Route)
OPTIONAL MATCH (ticket)-[:REFERENCED_BY]->(lake:Lake)
RETURN
  ticket.id AS id,
  author.id AS author_id,
  ticket.subject AS subject,
  ticket.text AS text,
  ticket.created_at AS created_at,
  route.id AS route_reference,
  lake.id AS lake_reference
    """

    tickets = []
    with driver.session() as session:
        for record in session.run(query):
            tickets.append(
                SupportTicket(
                    id=UUID4(record['id']),
                    author_id=record['author_id'],
                    subject=record['subject'],
                    text=record['text'],
                    created_at=record['created_at'].to_native(),
                    route_reference=record.get('route_reference'),
                    lake_reference=record.get('lake_reference'),
                ))

    return tickets


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
