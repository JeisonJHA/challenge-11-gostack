import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../assets/logo-header.png';
import SearchInput from '../../components/SearchInput';

import api from '../../services/api';
import formatValue from '../../utils/formatValue';

import {
  Container,
  Header,
  FilterContainer,
  Title,
  CategoryContainer,
  CategorySlider,
  CategoryItem,
  CategoryItemTitle,
  FoodsContainer,
  FoodList,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
} from './styles';

export interface Food {
  id: number;
  name: string;
  category: number;
  description: string;
  price: number;
  thumbnail_url: string;
  formattedPrice: string;
}

export interface Category {
  id: number;
  title: string;
  image_url: string;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [searchValue, setSearchValue] = useState('');

  const navigation = useNavigation();

  async function handleNavigate(id: number): Promise<void> {
    navigation.navigate('FoodDetails', { id });
  }

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      let params = {};
      if (selectedCategory) {
        params = { category_like: selectedCategory };
      } else if (searchValue !== '') {
        params = { name_like: searchValue };
      }

      api
        .get<Food[]>('foods', {
          params,
        })
        .then(response => {
          const orderList = response.data;
          const formattedData = orderList.map(
            item =>
              (({
                ...item,
                formattedValue: formatValue(item.price),
              } as unknown) as Food),
          );
          setFoods(formattedData);
        });
    }

    loadFoods();
  }, [selectedCategory, searchValue]);

  useEffect(() => {
    async function loadCategories(): Promise<void> {
      api.get<Category[]>('categories').then(response => {
        setCategories(response.data);
      });
    }

    loadCategories();
  }, []);

  function handleSelectCategory(id: number): void {
    setSelectedCategory(state => (state === id ? undefined : id));
  }

  return (
    <Container>
      <Header>
        <Image source={Logo} />
        <Icon
          name="log-out"
          size={24}
          color="#FFB84D"
          style={{ transform: [{ rotate: '-180deg' }] }}
          onPress={() => navigation.navigate('Home')}
        />
      </Header>
      <FilterContainer>
        <SearchInput
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder="Qual comida você procura?"
        />
      </FilterContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <CategoryContainer>
          <Title>Categorias</Title>
          <CategorySlider
            contentContainerStyle={{
              paddingHorizontal: 20,
            }}
            data={categories}
            keyExtractor={item => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: category }) => (
              <CategoryItem
                key={category.id}
                isSelected={category.id === selectedCategory}
                onPress={() => handleSelectCategory(category.id)}
                activeOpacity={0.6}
                testID={`category-${category.id}`}
              >
                <Image
                  style={{ width: 56, height: 56 }}
                  source={{ uri: category.image_url }}
                />
                <CategoryItemTitle>{category.title}</CategoryItemTitle>
              </CategoryItem>
            )}
          />
        </CategoryContainer>
        <FoodsContainer>
          <Title>Pratos</Title>
          <FoodList
            data={foods}
            keyExtractor={item => String(item.id)}
            renderItem={({ item: food }) => (
              <Food
                key={food.id}
                onPress={() => handleNavigate(food.id)}
                activeOpacity={0.6}
                testID={`food-${food.id}`}
              >
                <FoodImageContainer>
                  <Image
                    style={{ width: 88, height: 88 }}
                    source={{ uri: food.thumbnail_url }}
                  />
                </FoodImageContainer>
                <FoodContent>
                  <FoodTitle>{food.name}</FoodTitle>
                  <FoodDescription>{food.description}</FoodDescription>
                  <FoodPricing>{food.formattedPrice}</FoodPricing>
                </FoodContent>
              </Food>
            )}
          />
        </FoodsContainer>
      </SafeAreaView>
    </Container>
  );
};

export default Dashboard;
