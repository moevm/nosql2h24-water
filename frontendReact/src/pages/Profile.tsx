import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState({
    name: "Иван Иванов",
    email: "ivan@example.com",
    phone: "+7 (900) 123-45-67",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Здесь можно отправить изменения на сервер через API
    console.log("Сохранено:", profile);
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
      <Typography variant="h4" gutterBottom>
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
    </Box>
  );
};

export default Profile;

