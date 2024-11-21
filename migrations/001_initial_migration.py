from neo4j import GraphDatabase

# Connection details
uri = "bolt://localhost:7687"
user = "neo4j"
password = "neo4jpassword"


# Function to create constraints and indexes
def create_constraints_and_indexes(driver):
    with driver.session() as session:
        # User id uniqueness constraint
        session.run("""
        CREATE CONSTRAINT user_id_unique IF NOT EXISTS
        FOR (u:User)
        REQUIRE u.id IS UNIQUE
        """)

        # Point id uniqueness constraint
        session.run("""
        CREATE CONSTRAINT point_id_unique IF NOT EXISTS
        FOR (p:Point)
        REQUIRE p.id IS UNIQUE
        """)

        # Route id uniqueness constraint
        session.run("""
        CREATE CONSTRAINT route_id_unique IF NOT EXISTS
        FOR (r:Route)
        REQUIRE r.id IS UNIQUE
        """)

        # Lake id uniqueness constraint
        session.run("""
        CREATE CONSTRAINT lake_id_unique IF NOT EXISTS
        FOR (l:Lake)
        REQUIRE l.id IS UNIQUE
        """)

        # SupportRequest id uniqueness constraint
        session.run("""
        CREATE CONSTRAINT supportrequest_id_unique IF NOT EXISTS
        FOR (s:SupportRequest)
        REQUIRE s.id IS UNIQUE
        """)


# Main execution
if __name__ == "__main__":
    driver = GraphDatabase.driver(uri, auth=(user, password))
    create_constraints_and_indexes(driver)
    driver.close()
