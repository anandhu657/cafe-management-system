CREATE TABLE user(
    id int PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(250),
    contactNumber VARCHAR(20),
    email VARCHAR(50),
    password VARCHAR(250),
    status VARCHAR(20),
    role VARCHAR(20),
    UNIQUE (email)
);
INSERT INTO user (
        name,
        contactNumber,
        email,
        password,
        status,
        role
    )
VALUES(
        'Admin',
        '9876543210',
        'admin@gmail.com',
        'admin',
        'true',
        'admin'
    );