import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { ScrollView, BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import PageHeader from '../../components/PageHeader';
import TeacherItem, { Teacher } from '../../components/TeacherItem';

import api from '../../services/api';

import styles from './styles';

const TeacherList: React.FC = () => {
  const [teachers, setTeachers] = useState([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const [subject, setSubject] = useState('');
  const [week_day, setWeekDay] = useState('');
  const [time, setTime] = useState('');

  const loadFavorites = useCallback(() => {
    AsyncStorage.getItem('favorites').then(response => {
      if (response) {
        const favoritedTeachers = JSON.parse(response);
        const favoritedTeachersIDs = favoritedTeachers.map((teacher: Teacher) => {
          return teacher.id;
        });

        setFavorites(favoritedTeachersIDs);
      };
    })
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  )

  const handleToogleIsVisible = useCallback(() => {
    setIsFiltersVisible(!isFiltersVisible);
  }, [isFiltersVisible]);

  const handleFiltersSubmit = useCallback(async () => {
    loadFavorites();

    const response = await api.get('/classes', {
      params: {
        subject: subject,
        week_day: Number(week_day),
        time: time,
      }
    });

    setIsFiltersVisible(false);
    setTeachers(response.data);
  }, []);

  return (
    <View style={styles.container}>
      <PageHeader
        title="Proffys disponíveis"
        headerRight={
          <BorderlessButton onPress={handleToogleIsVisible}>
            <Feather name="filter" size={20} color="#FFF" />
          </BorderlessButton>
        }
      >
        {isFiltersVisible && (
          <View style={styles.searchForm}>
          <Text style={styles.label}>Matéria</Text>
          <TextInput
            style={styles.input}
            placeholder="Qual a matéria"
            placeholderTextColor="#c1bccc"
            value={subject}
            onChangeText={text => setSubject(text)}
          />

          <View style={styles.inputGroup}>
            <View style={styles.inputBlock}>
              <Text style={styles.label}>Dia da Semana</Text>
              <TextInput
                style={styles.input}
                placeholder="Qual o dia?"
                placeholderTextColor="#c1bccc"
                value={week_day}
                onChangeText={text => setWeekDay(text)}
              />
            </View>

            <View style={styles.inputBlock}>
              <Text style={styles.label}>Horário</Text>
              <TextInput
                style={styles.input}
                placeholder="Qual horário?"
                placeholderTextColor="#c1bccc"
                value={time}
                onChangeText={text => setTime(text)}
              />
            </View>
          </View>

          <RectButton onPress={handleFiltersSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Filtrar</Text>
          </RectButton>
        </View>
        )}
      </PageHeader>

      <ScrollView
        style={styles.teacherList}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: 16,
        }}
      >
        {teachers.map((teacher: Teacher) => (
          <TeacherItem
            key={teacher.id}
            teacher={teacher}
            favorited={favorites.includes(teacher.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default TeacherList;
