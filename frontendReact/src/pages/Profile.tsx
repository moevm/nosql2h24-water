import React, { useState } from "react";
import { TextField, Button, Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Используем useNavigate

const Profile: React.FC = () => {
    const [profile, setProfile] = useState({
        name: "Иван Иванов",
        email: "ivan@example.com",
        phone: "+7 (900) 123-45-67",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [routes, setRoutes] = useState([
        { id: 1, name: "Маршрут 1", date: "15 декабря 2024" },
        { id: 2, name: "Маршрут 2", date: "20 декабря 2024" },
        { id: 3, name: "Маршрут 3", date: "25 декабря 2024" },
    ]);

    const navigate = useNavigate(); // Хук для навигации

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    };

    const handleSave = () => {
        setIsEditing(false);
        console.log("Сохранено:", profile);
    };

    const handleBack = () => {
        navigate(-1); // Возвращаемся на предыдущую страницу
    };

    const handleRouteClick = (routeId: number) => {
        navigate(`/route/${routeId}`); // Переходим к выбранному маршруту
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding={3}
            bgcolor="#f5f5f5"
            height="100vh"
        >
            <Button variant="outlined" color="secondary" onClick={handleBack} sx={{ alignSelf: "flex-start" }}>
                Назад
            </Button>
            <Typography variant="h4" gutterBottom sx={{ marginTop: 2 }}>
                Профиль пользователя
            </Typography>
            <Box
                component="form"
                display="flex"
                flexDirection="column"
                alignItems="center"
                width={300}
            >
                <TextField
                    label="Имя"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    margin="normal"
                    fullWidth
                />
                <TextField
                    label="Email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    margin="normal"
                    fullWidth
                />
                <TextField
                    label="Телефон"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    margin="normal"
                    fullWidth
                />
                {isEditing ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        sx={{ marginTop: 2 }}
                    >
                        Сохранить
                    </Button>
                ) : (
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setIsEditing(true)}
                        sx={{ marginTop: 2 }}
                    >
                        Редактировать
                    </Button>
                )}
            </Box>

            <Box sx={{ marginTop: 4, width: "100%" }}>
                <Typography variant="h6">Мои маршруты:</Typography>
                <List>
                    {routes.map((route) => (
                        <ListItem button key={route.id} onClick={() => handleRouteClick(route.id)}>
                            <ListItemText primary={`${route.name} - ${route.date}`} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
};

export default Profile;
