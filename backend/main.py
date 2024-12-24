from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from neo4j import GraphDatabase
from uuid import UUID

import uvicorn
import os
from datetime import datetime

app = FastAPI()

NEO4J_URI = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
NEO4J_USER = os.getenv('NEO4J_USER', 'neo4j')
NEO4J_PASSWORD = os.getenv('NEO4J_PASSWORD', 'neo4j')

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


class User(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime
    avatar_url: str


class NewUserRequest(BaseModel):
    name: str
    email: str


@app.post("/users/new", response_model=str)
def create_user(req: NewUserRequest) -> str:
    query = """
       CREATE (u:User {
           id: randomUUID(),
           name: $name,
           email: $email,
           created_at: timestamp(),
           updated_at: timestamp(),
           avatar_url: ""
       })
       RETURN u
       """

    with driver.session() as session:
        data = session.run(query, req.dict()).single()

    if not data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    return data['u']['id']


@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: UUID) -> User:
    query = """
    MATCH (u:User {id: $user_id})
    RETURN u
    """

    with driver.session() as session:
        data = session \
                .run(query, {"user_id": user_id.hex}) \
                .single()

    if not data:
        raise HTTPException(status_code=404, detail="User not found")

    return User(
        id=UUID(data[id]),
        name=data['name'],
        email=data['email'],
        created_at=datetime.fromtimestamp(data['created_at'] / 1000.0),
        updated_at=datetime.fromtimestamp(data['updated_at'] / 1000.0),
        avatar_url=data['avatar_url'],
    )


@app.get("/users", response_model=List[User])
def list_users() -> List[User]:
    query = """
    MATCH (u:User)
    RETURN u
    """

    users: List[User] = []
    with driver.session() as session:
        for record in session.run(query):
            data = record['u']

            user = User(
                id=UUID(data['id']),
                name=data['name'],
                email=data['email'],
                created_at=datetime.fromtimestamp(data['created_at'] / 1000.0),
                updated_at=datetime.fromtimestamp(data['updated_at'] / 1000.0),
                avatar_url=data['avatar_url'],
            )

            users.append(user)

    return users


class Point(BaseModel):
    id: UUID
    coordinates: dict
    description: str
    availability: float


class CreatePointRequest(BaseModel):
    coordinates: dict
    description: str
    availability: float


@app.post("/points/new", response_model=str)
def create_point(req: CreatePointRequest) -> str:
    query = """
       CREATE (p:Point {
           id: randomUUID(),
           coordinates: point({latitude: $lat, longitude: $lon}),
           description: $description,
           availability: $availability
       })
       RETURN p
       """

    point = req.dict()
    point["lat"] = req.coordinates["coordinates"][0]
    point["lon"] = req.coordinates["coordinates"][1]

    with driver.session() as session:
        data = session.run(query, point).single()

    if not data:
        raise HTTPException(status_code=500, detail="Failed to create point")

    return data['p']['id']


@app.get("/points/{point_id}", response_model=Point)
def get_point(point_id: UUID) -> Point:
    query = """
    MATCH (p:Point {id: $point_id})
    RETURN p
    """

    with driver.session() as session:
        data = session \
                .run(query, {"point_id": point_id.hex}) \
                .single()

    if not data:
        raise HTTPException(status_code=404, detail="Failed to find point")

    point = data['p']
    return Point(
        id=UUID(point['id']),
        coordinates={
            "type": "Point",
            "coordinates": [
                point['coordinates'][0],
                point['coordinates'][1],
            ],
        },
        description=point['description'],
        availability=float(point['availability']),
    )


@app.get("/points", response_model=List[Point])
def list_points() -> List[Point]:
    query = """
    MATCH (p:Point)
    RETURN p
    """

    points: List[Point] = []
    with driver.session() as session:
        for record in session.run(query):
            data = record['p']

            point = Point(
                id=UUID(data['id']),
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
    id: UUID
    point_ids: List[UUID]
    author_id: UUID
    popularity_score: float


class CreateRouteRequest(BaseModel):
    point_ids: List[UUID]
    author: UUID
    popularity_score: float


@app.post("/routes/new", response_model=UUID)
def create_route(req: CreateRouteRequest) -> UUID:
    query = """
MATCH (a:User {id: $author_id})
WITH a
WHERE a IS NOT NULL

UNWIND $point_ids AS pid
MATCH (p:Point {id: pid})
WITH a, collect(p) AS points
WHERE size(points) = size($point_ids)

CREATE (r:Route {id: randomUUID(), popularity_score: $popularity_score})
CREATE (r)-[:CREATED_BY]->(a)
FOREACH (point IN points | CREATE (r)-[:HAS_POINT]->(point))
RETURN r
       """

    route = {
        "author_id": str(req.author),
        "point_ids": list(map(str, req.point_ids)),
        "popularity_score": req.popularity_score,
    }

    with driver.session() as session:
        data = session.run(query, route).single()

    if not data:
        raise HTTPException(status_code=500, detail="Internal error")

    return UUID(data['r']['id'])


@app.get("/routes/{route_id}", response_model=Route)
def get_route(route_id: UUID) -> Route:
    query = """
    MATCH (r:Route {id: $route_id})
    OPTIONAL MATCH (r)-[:HAS_POINT]->(p:Point)
    OPTIONAL MATCH (r)-[:CREATED_BY]->(u:User)
    RETURN r, collect(p.id) as points, u.id as author_id
    """

    with driver.session() as session:
        data = session.run(query, {"route_id": str(route_id)}).single()

    if not data:
        raise HTTPException(status_code=404, detail="Not found")

    return Route(
        id=UUID(data['r']['id']),
        author_id=UUID(data['author_id']),
        point_ids=[UUID(point_id) for point_id in data['points']['point_ids']],
        popularity_score=float(data['r']['popularity_score']),
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
                    id=UUID(route['id']),
                    author_id=UUID(author),
                    point_ids=[UUID(point) for point in points],
                    popularity_score=float(route['popularity_score']),
                ))

    return routes


class Lake(BaseModel):
    id: UUID
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


@app.post("/lakes/new", response_model=UUID)
def create_lake(req: CreateLakeRequest) -> UUID:
    query = """
CREATE (l:Lake {
    id: randomUUID(),
    name: $name,
    description: $description,
    coordinates_boundary: [c IN $coordinates_boundary | point({
        longitude: c.lon,
        latitude: c.lat
    })],
    availability_score: $availability,
    max_depth: $max_depth,
    inflowing_rivers: $inflowing_rivers,
    outflowing_rivers: $outflowing_rivers,
    salinity: $salinity
})
RETURN l
       """

    lake = req.dict()
    lake['coordinates_boundary'] = \
        [{"lon": point[0], "lat": point[1]}
            for point in req.coordinates_boundary['coordinates'][0]]

    with driver.session() as session:
        data = session.run(query, lake).single()

    if not data:
        raise HTTPException(status_code=500, detail="Failed to create lake")

    return UUID(data['l']['id'])


@app.get("/lakes/{lake_id}", response_model=Lake)
def get_lake(lake_id: UUID) -> Lake:
    query = """
    MATCH (l:Lake {id: $lake_id})
    RETURN l
    """

    with driver.session() as session:
        data = session.run(query, {"lake_id": str(lake_id)}).single()

    if not data:
        raise HTTPException(status_code=404, detail="Lake not found")

    lake = data['l']
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
    id: UUID
    author_id: UUID
    subject: str
    text: str
    created_at: datetime
    route_reference: Optional[UUID] = None
    lake_reference: Optional[UUID] = None


class CreateSupportTicketRequest(BaseModel):
    author_id: UUID
    subject: str
    text: str
    route_reference: Optional[UUID] = None
    lake_reference: Optional[UUID] = None


@app.post("/support-tickets/new", response_model=UUID)
def create_support_ticket(req: CreateSupportTicketRequest) -> UUID:
    query = """
MATCH (author:User {id: $author_id})
CREATE (ticket:SupportTicket {
    id: randomUUID(),
    subject: $subject,
    text: $text,
    created_at: timestamp()
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

    ticket = req.dict()
    ticket['author_id'] = str(req.author_id)

    with driver.session() as session:
        data = session.run(query, ticket).single()

    if not data:
        raise HTTPException(status_code=500, detail="Failed to create ticket")

    return data['t']['id']


@app.get("/support-tickets/{ticket_id}", response_model=SupportTicket)
def get_support_ticket(ticket_id: UUID) -> SupportTicket:
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

    with driver.session() as session:
        data = session.run(query, {"ticket_id": ticket_id.hex}).single()

    if not data:
        raise HTTPException(status_code=404, detail="Failed to find ticket")

    return SupportTicket(
        id=UUID(data['id']),
        author_id=data['author_id'],
        subject=data['subject'],
        text=data['text'],
        created_at=datetime.fromtimestamp(data['created_at'] / 1000.0),
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

    tickets: List[SupportTicket] = []
    with driver.session() as session:
        for record in session.run(query):
            tickets.append(
                SupportTicket(
                    id=UUID(record['id']),
                    author_id=record['author_id'],
                    subject=record['subject'],
                    text=record['text'],
                    created_at=datetime.fromtimestamp(record['created_at'] /
                                                      1000.0),
                    route_reference=record.get('route_reference'),
                    lake_reference=record.get('lake_reference'),
                ))

    return tickets


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
