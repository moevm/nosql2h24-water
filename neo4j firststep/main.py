from neo4j import GraphDatabase

uri = "bolt://localhost:7687"  # URI Neo4j (обычно bolt-соединение)
username = "neo4j"              # Имя пользователя
password = "password"           # Пароль

driver = GraphDatabase.driver(uri, auth=(username, password))

def create_person(tx, name, age):
    tx.run("CREATE (p:Person {name: $name, age: $age})", name=name, age=age)

def get_people(tx):
    result = tx.run("MATCH (p:Person) RETURN p.name AS name, p.age AS age")
    for record in result:
        print(f"Name: {record['name']}, Age: {record['age']}")
        
def clear_database(tx):
    tx.run("MATCH (n) DETACH DELETE n")

with driver.session() as session:
    session.write_transaction(create_person, "Alice", 30)
    session.write_transaction(create_person, "Bob", 24)
    print("List of people:")
    session.read_transaction(get_people)

driver.close()