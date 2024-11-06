import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = 8080;

app.use(express.json());

// URL do servidor de arquivos
const FILE_SERVER_URL = 'http://129.148.24.46:8086/file/download';

// Rota para receber o ID da playlist e user
app.post('/playlist', async (req, res) => {
  console.log('Corpo da requisição recebido:', req.body);
  const { playlistId, userId } = req.body;

  if (!playlistId || !userId) {
    console.error('Parâmetros faltando:', req.body);
    return res.status(400).send('Requisição inválida, parâmetros faltando.');
  }

  console.log(`Requisição recebida: Playlist ID: ${playlistId}, User ID: ${userId}`);

  try {
    // Faz a requisição ao servidor de arquivos com os parâmetros recebidos
    const fileServerResponse = await fetch(FILE_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({user: userId, playlist: playlistId}),
    });

    if (fileServerResponse.ok) {
      const playlistData = await fileServerResponse.json();
      console.log('Playlist baixada com sucesso:', playlistData);
      
      // Retorna a playlist processada para o aplicativo
      res.status(200).json(playlistData);
    } else {
      console.error('Erro ao baixar playlist do servidor de arquivos.');
      res.status(500).send('Erro ao baixar a playlist.');
    }
  } catch (error) {
    console.error('Erro ao comunicar com o servidor de arquivos:', error);
    res.status(500).send('Erro ao processar a requisição.');
  }
});

app.listen(port, () => {
  console.log(`Servidor HTTP rodando na porta ${port}.`);
});