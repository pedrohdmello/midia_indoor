import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const DashboardCharts = ({ projects }) => {
  // Dados para o gráfico de barras (Progresso dos Projetos) com responsáveis
  const progressData = projects.map((project) => ({
    name: `${project.name} - ${project.responsible}`,
    progress: project.progress,
    endDate: project.endDate,
  }));

  // Dados formatados para o gráfico de barras
  const barChartData = {
    labels: progressData.map((entry) => entry.name),
    datasets: [
      {
        data: progressData.map((entry) => entry.progress),
      },
    ],
  };

  // Dados para o gráfico de pizza (Status dos Projetos)
  const statusCount = projects.reduce(
    (acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    },
    { 'Em Andamento': 0, 'Concluído': 0, 'Atrasado': 0 }
  );

  const statusData = Object.keys(statusCount).map((key, index) => ({
    name: key,
    value: statusCount[key],
    color: ['#FF9800', '#4CAF50', '#F44336'][index % 3],
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Gráfico de Barras */}
      <View style={styles.chartWrapper}>
        <Text style={styles.title}>Progresso dos Projetos com Responsável</Text>
        <BarChart
          data={barChartData}
          width={screenWidth * 0.9} // Ajuste proporcional à tela
          height={250}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(34, 128, 176, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForLabels: {
              dx: -5, // Ajuste fino para mover as labels no eixo X
            },
          }}
          verticalLabelRotation={30}
        />
      </View>

      {/* Gráfico de Pizza */}
      <View style={styles.chartWrapper}>
        <Text style={styles.title}>Status dos Projetos</Text>
        <PieChart
          data={statusData}
          width={screenWidth * 0.9}
          height={250}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 60, // Adiciona espaço inicial para descer os gráficos abaixo do botão de voltar
    paddingBottom: 20, // Espaçamento adicional no final da tela
    backgroundColor: '#f5f5f5',
    alignItems: 'center', // Centraliza os gráficos horizontalmente
  },
  chartWrapper: {
    marginBottom: 100, // Espaçamento entre os gráficos
    width: '95%', // Ajusta a largura do gráfico proporcional à tela
    alignItems: 'center', // Centraliza o conteúdo interno dos gráficos
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15, // Espaço entre o título e o gráfico
    textAlign: 'center',
  },
});

export default DashboardCharts;
