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


class Point(BaseModel):
    id: str
    coordinates: dict
    description: str
    availability: float


class Route(BaseModel):
    id: str
    points: List[str]
    author: str
    popularity_score: float


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


class SupportRequestReview(BaseModel):
    text: str
    date: str
    photo: str


class SupportRequest(BaseModel):
    id: str
    author: str
    route_reference: Optional[str] = None
    lake_reference: Optional[str] = None
    subject: str
    reviews: List[SupportRequestReview]


# Helper function to execute Neo4j queries
def run_query(cypher_query, parameters=None):
    with driver.session() as session:
        return session.run(cypher_query, parameters)


class User(BaseModel):
    id: UUID4
    name: str
    email: EmailStr
    registration_date: datetime
    profile_update_date: datetime
    avatar_url: str


class NewUserRequest(BaseModel):
    name: str
    email: str


@app.post("/users/new")
def create_user(user_request: NewUserRequest) -> None:
    timestamp = datetime.now(timezone.utc)
    new_id = uuid.uuid4()

    user = User(
        id=new_id,
        name=user_request.name,
        email=user_request.email,
        registration_date=timestamp,
        profile_update_date=timestamp,
        avatar_url="",
    )

    query = """
       CREATE (u:User {
           id: $id,
           name: $name,
           email: $email,
           registration_date: datetime($registration_date),
           profile_update_date: datetime($profile_update_date),
           avatar_url: $avatar_url
       })
       RETURN u
       """

    user_prepared = user.dict()
    user_prepared["id"] = user_prepared["id"].hex

    with driver.session() as session:
        result = session.run(query, user_prepared)
        if not result.data():
            raise HTTPException(status_code=500,
                                detail="Failed to create user")


@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: str) -> User:
    query = """
    MATCH (u:User {id: $user_id})
    RETURN u
    """

    with driver.session() as session:
        result = session.run(query, {"user_id": user_id})
        data = result['u'][0]

    if not data:
        raise HTTPException(404, "User not found")

    return User(
        id=UUID4(data[id]),
        name=data['name'],
        email=data['email'],
        registration_date=data['registration_date'].to_native(),
        profile_update_date=data['profile_update_date'].to_native(),
        avatar_url=data['avatar_url'],
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
                registration_date=data['registration_date'].to_native(),
                profile_update_date=data['profile_update_date'].to_native(),
                avatar_url=data['avatar_url'],
            )

            users.append(user)

    return users


@app.get("/points/{point_id}", response_model=Point)
def get_point(point_id: str):
    query = """
    MATCH (p:Point {id: $point_id})
    RETURN p
    """
    result = run_query(query, {"point_id": point_id})
    if result:
        point = result[0]['p']
        return Point(**point)
    return {}


@app.get("/points", response_model=List[Point])
def list_points():
    query = """
    MATCH (p:Point)
    RETURN p
    """
    result = run_query(query)
    points = [Point(**record['p']) for record in result]
    return points


# Route Endpoints
@app.get("/routes/{route_id}", response_model=Route)
def get_route(route_id: str):
    query = """
    MATCH (r:Route {id: $route_id})
    OPTIONAL MATCH (r)-[:HAS_POINT]->(p:Point)
    RETURN r, collect(p.id) as points
    """
    result = run_query(query, {"route_id": route_id})
    if result:
        route = result[0]['r']
        route['points'] = result[0]['points']
        return Route(**route)
    return {}


@app.get("/routes", response_model=List[Route])
def list_routes():
    query = """
    MATCH (r:Route)
    OPTIONAL MATCH (r)-[:HAS_POINT]->(p:Point)
    WITH r, collect(p.id) as points
    RETURN r, points
    """
    result = run_query(query)
    routes = []
    for record in result:
        route = record['r']
        route['points'] = record['points']
        routes.append(Route(**route))
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


@app.get("/support-requests/{request_id}", response_model=SupportRequest)
def get_support_request(request_id: str):
    query = """
    MATCH (s:SupportRequest {id: $request_id})
    OPTIONAL MATCH (s)-[:HAS_REVIEW]->(r:Review)
    RETURN s, collect(r) as reviews
    """
    result = run_query(query, {"request_id": request_id})
    if result:
        support_request = result[0]['s']
        reviews = result[0]['reviews'] or []
        support_request['reviews'] = [
            SupportRequestReview(**rev) for rev in reviews
        ]
        return SupportRequest(**support_request)
    return {}


@app.get("/support-requests", response_model=List[SupportRequest])
def list_support_requests():
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
        reviews = record['reviews'] or []
        support_request['reviews'] = [
            SupportRequestReview(**rev) for rev in reviews
        ]
        support_requests.append(SupportRequest(**support_request))
    return support_requests


@app.post("/points/new", response_model=Point)
def create_point(point: Point):
    query = """
       CREATE (p:Point {
           id: $id,
           coordinates: $coordinates,
           description: $description,
           availability: $availability
       })
       RETURN p
       """
    result = run_query(query, point.dict())
    if result:
        point_data = result[0]['p']
        return Point(**point_data)
    else:
        raise HTTPException(status_code=500, detail="Failed to create point")


@app.post("/routes/new", response_model=Route)
def create_route(route: Route):
    query = """
       CREATE (r:Route {
           id: $id,
           author: $author,
           popularity_score: $popularity_score
       })
       WITH r
       UNWIND $points as point_id
       MATCH (p:Point {id: point_id})
       CREATE (r)-[:HAS_POINT]->(p)
       RETURN r
       """
    parameters = route.dict()
    parameters['points'] = route.points
    result = run_query(query, parameters)
    if result:
        route_data = result[0]['r']
        route_data['points'] = route.points
        return Route(**route_data)
    else:
        raise HTTPException(status_code=500, detail="Failed to create route")


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


@app.post("/support-requests/new", response_model=SupportRequest)
def create_support_request(request: SupportRequest):
    query = """
       CREATE (s:SupportRequest {
           id: $id,
           subject: $subject
       })
       WITH s
       MATCH (u:User {id: $author})
       CREATE (s)-[:CREATED_BY]->(u)
       FOREACH (route_id IN CASE WHEN $route_reference IS NULL THEN [] ELSE [$route_reference] END |
           MATCH (r:Route {id: route_id})
           CREATE (s)-[:RELATED_TO_ROUTE]->(r)
       )
       FOREACH (lake_id IN CASE WHEN $lake_reference IS NULL THEN [] ELSE [$lake_reference] END |
           MATCH (l:Lake {id: lake_id})
           CREATE (s)-[:RELATED_TO_LAKE]->(l)
       )
       WITH s
       UNWIND $reviews AS review
       CREATE (rev:Review {
           text: review.text,
           date: review.date,
           photo: review.photo
       })
       CREATE (s)-[:HAS_REVIEW]->(rev)
       RETURN s
       """
    parameters = request.dict()
    parameters['reviews'] = [review.dict() for review in request.reviews]
    result = run_query(query, parameters)
    if result:
        support_request_data = result[0]['s']
        support_request_data['reviews'] = request.reviews
        return SupportRequest(**support_request_data)
    else:
        raise HTTPException(status_code=500,
                            detail="Failed to create support request")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
