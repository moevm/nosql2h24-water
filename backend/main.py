from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from neo4j import GraphDatabase
import uvicorn

app = FastAPI()

# Neo4j database credentials
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "neo4j"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


# Data Models
class User(BaseModel):
    id: str
    email: str
    registration_date: str
    profile_update_date: str
    avatar_url: str


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
        result = session.run(cypher_query, parameters)
        return [record.data() for record in result]


# User Endpoints
@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: str):
    query = """
    MATCH (u:User {id: $user_id})
    RETURN u
    """
    result = run_query(query, {"user_id": user_id})
    if result:
        user = result[0]['u']
        return User(**user)
    return {}


@app.get("/users", response_model=List[User])
def list_users():
    query = """
    MATCH (u:User)
    RETURN u
    """
    result = run_query(query)
    users = [User(**record['u']) for record in result]
    return users


# Point Endpoints
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


# Lake Endpoints
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


# SupportRequest Endpoints
@app.get("/support_requests/{request_id}", response_model=SupportRequest)
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


@app.get("/support_requests", response_model=List[SupportRequest])
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


def create_person(tx, name, age):
    tx.run("CREATE (p:Person {name: $name, age: $age})", name=name, age=age)


def get_people(tx):
    result = tx.run("MATCH (p:Person) RETURN p.name AS name, p.age AS age")
    for record in result:
        print(f"Name: {record['name']}, Age: {record['age']}")


def clear_database(tx):
    tx.run("MATCH (n) DETACH DELETE n")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=34567)
