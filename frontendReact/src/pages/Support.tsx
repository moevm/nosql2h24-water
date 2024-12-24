import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Input,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Support: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleSubmit = () => {
    // Имитация отправки сообщения
    console.log("Сообщение отправлено:", { email, message, file });
    setOpenSnackbar(true);
    setSubmitted(true);
    setMessage("");
    setEmail("");
    setFile(null);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (submitted) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        bgcolor="#f5f5f5"
      >
        <Typography variant="h4" gutterBottom>
          Спасибо за ваш отзыв!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setSubmitted(false)}
          sx={{ marginTop: 2 }}
        >
          Вернуться в Поддержку
        </Button>
      </Box>
    );
  }

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
        Поддержка
      </Typography>
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        alignItems="center"
        width={300}
      >
        <TextField
          label="Ваш Email"
          type="email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Сообщение"
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
        />
        <Button variant="contained" component="label" sx={{ marginTop: 2 }}>
          Прикрепить файл
          <Input
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        {file && (
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            Прикреплено: {file.name}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          sx={{ marginTop: 2 }}
        >
          Отправить
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate(-1)} // Вернуться на предыдущую страницу
          sx={{ marginTop: 2 }}
        >
          Назад
        </Button>
      </Box>

      {/* Уведомление об успешной отправке */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Сообщение отправлено"
      />
    </Box>
  );
};

export default Support;

