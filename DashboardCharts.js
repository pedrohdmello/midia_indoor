import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const DashboardCharts = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://129.148.24.46:8085/dash');
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }
        const data = await response.json();

        // Transforma os dados no formato esperado
        const formattedProjects = [
          {
            name: data.nome,
            status: data.status === 'Fazendo' ? 'Em Andamento' : data.status,
            startDate: data.dtInicio,
            endDate: data.dtFinal,
            responsible: data.responsavel,
            progress: data.conclusao,
          },
        ];
        setProjects(formattedProjects);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados do dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro: {error}</Text>
      </View>
    );
  }

  // Dados para o gráfico de barras (Progresso dos Projetos) com responsáveis
  const progressData = projects.map((project) => ({
    name: `${project.name} - ${project.responsible}`,
    progress: Math.min(Math.max(project.progress, 0), 100),
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
          height={280}
          yAxisLabel=""
          yAxisSuffix="%"
          fromZero={true}
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
          verticalLabelRotation={0}
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
    paddingTop: 90,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  chartWrapper: {
    marginBottom: 70,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default DashboardCharts;
