import React, { useEffect, useState } from 'react';
import { View, Image, Text, ActivityIndicator, Button } from 'react-native';
import { Video } from 'expo-av';
import base64 from 'react-native-base64';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const servidor_playlist = 'http://192.168.0.10:8080/playlist';

export default function ReprodutorDePlaylist() {
  const [playlist, setPlaylist] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const { width } = useWindowDimensions();

  // Função para buscar a playlist
  
  const buscarPlaylist = async (playlistId, userId) => {
    try {
      setCarregando(true);
      
      const response = await fetch(servidor_playlist, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistId, userId }),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Lê o texto do erro em caso de falha
        throw new Error(`Erro ao baixar a playlist: ${errorText}`);
      }
      
      const dadosPlaylist = await response.json();
      console.log('Dados da Playlist:', dadosPlaylist);

      if (dadosPlaylist && dadosPlaylist.length > 0) {
        const arquivos = dadosPlaylist.map(item => ({
          fileContent: item.file.fileContent,
          fileName: item.file.fileName,
          time: item.time,
        }));
        setPlaylist(arquivos);
        setIndiceAtual(0);
      } else {
        console.error('Estrutura inesperada na resposta:', dadosPlaylist);
        throw new Error('Estrutura de dados da playlist inválida.');
      }
    } catch (erro) {
      console.error('Erro ao baixar playlist:', erro.message);
    } finally {
      setCarregando(false);
    }
  };

  // Função para identificar o tipo de mídia a partir da extensão do arquivo
  const obterTipoDeMidia = (fileName) => {
    const formato = fileName.split('.').pop().toLowerCase();
    switch (formato) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      case 'mp4':
        return 'video';
      case 'txt':
        return 'text';
      case 'html':
        return 'html';
      default:
        return 'unsupported';
    }
  };

  // Função para exibir a mídia atual e passar para a próxima após o tempo definido
  const reproduzirMidiaAtual = () => {
    const midiaAtual = playlist[indiceAtual];

    setTimeout(() => {
      // Move para o próximo item ou volta ao primeiro
      setIndiceAtual((indiceAnterior) => (indiceAnterior + 1) % playlist.length);
    }, midiaAtual.time * 1000); // Tempo em milissegundos
  };

  useEffect(() => {
    if (playlist.length > 0) reproduzirMidiaAtual();
  }, [indiceAtual, playlist]);

  const renderizarMidia = () => {
    const midiaAtual = playlist[indiceAtual];
    const { fileContent, fileName } = midiaAtual;
    const tipoDeMidia = obterTipoDeMidia(fileName);
    const urlArquivo = `data:${tipoDeMidia};base64,${fileContent}`;

    if (tipoDeMidia === 'image') {
      return <Image source={{ uri: urlArquivo }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />;
    } else if (tipoDeMidia === 'video') {
      return (
        <Video
          source={{ uri: urlArquivo }}
          style={{ width: '100%', height: '100%' }}
          useNativeControls
          resizeMode="contain"
          shouldPlay
        />
      );
    } else if (tipoDeMidia === 'text') {
      const textoDecodificado = base64.decode(fileContent);
      return (
        <View style={{ padding: 20 }}>
          {typeof textoDecodificado === 'string' ? (
            <Text>{textoDecodificado}</Text>
          ) : (
            <Text>Erro ao exibir o texto</Text>
          )}
        </View>
      );
    } else if (tipoDeMidia === 'html') {
      const htmlContent = base64.decode(fileContent);
      return (
        <RenderHtml
          contentWidth={width}
          source={{ html: htmlContent }}
        />);
    } else {
      return <Text>Formato de mídia não suportado</Text>;
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {carregando ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : playlist.length === 0 ? (
        <Button title="Baixar playlist do Servidor" onPress={() => buscarPlaylist(19, 1)} />
      ) : (
        renderizarMidia()
      )}
    </View>
  );
}
