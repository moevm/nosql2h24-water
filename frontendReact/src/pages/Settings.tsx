import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("mail@gmail.com");
  const [language, setLanguage] = useState("Русский");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLanguage(event.target.value as string);
  };

  const handlePasswordVisibilityToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleChangePassword = () => {
    console.log("Redirecting to change password page...");
    // Здесь можно выполнить переход на страницу смены пароля
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f5f5f5"
      padding={3}
    >
      <Typography variant="h4" gutterBottom>
        Настройки
      </Typography>
      <Box width={300}>
        {/* Email */}
        <TextField
          label="Ваш Email"
          variant="outlined"
          value={email}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true,
          }}
        />
        {/* Язык */}
        <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
          Язык
        </Typography>
        <Select
          value={language}
          onChange={handleLanguageChange}
          fullWidth
          variant="outlined"
          sx={{ marginBottom: 2 }}
        >
          <MenuItem value="Русский">Русский</MenuItem>
          <MenuItem value="English">English</MenuItem>
        </Select>
        {/* Пароль */}
        <TextField
          label="Ваш пароль"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handlePasswordVisibilityToggle}>
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="text"
          color="primary"
          onClick={handleChangePassword}
          sx={{ marginBottom: 2 }}
        >
          Поменять пароль
        </Button>
        {/* Кнопка "Назад" */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate(-1)} // Возврат на предыдущую страницу
          fullWidth
        >
          Назад
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;

