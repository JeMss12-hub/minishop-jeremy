<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <img slot="start" src="/logo.svg" alt="Mini Shop logo" class="page-logo" />
        <ion-title>Inventory</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchTerm" placeholder="Search inventory" @ionInput="filterProducts" />
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card class="add-card ion-margin-bottom">
        <ion-card-header>
          <ion-card-title>Add Product</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label position="stacked">Product name</ion-label>
            <input v-model="newProduct.name" placeholder="Enter product name" class="native-input" />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Category</ion-label>
            <input v-model="newProduct.category" placeholder="e.g. Phones" class="native-input" />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Price</ion-label>
            <input v-model="newProduct.price" type="number" min="0" placeholder="0" class="native-input" />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Quantity</ion-label>
            <input v-model="newProduct.quantity" type="number" min="0" placeholder="0" class="native-input" />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Description</ion-label>
            <textarea v-model="newProduct.description" placeholder="Description" class="native-textarea" rows="3" />
          </ion-item>

          <ion-button expand="block" class="ion-margin-top" :disabled="isSaving" @click="saveProduct">
            {{ isSaving ? 'Saving product…' : 'Save Product' }}
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-list class="inventory-list">
        <ion-item v-for="product in filteredProducts" :key="product.id">
          <ion-label>
            <h2>{{ product.name }}</h2>
            <p>{{ product.category }} | ₱{{ product.price }}</p>
            <ion-badge color="primary">Stock: {{ product.quantity }}</ion-badge>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Product } from '../models/product';

const products = ref<Product[]>([]);
const filteredProducts = ref<Product[]>([]);
const searchTerm = ref('');
const isSaving = ref(false);
const newProduct = ref({
  name: '',
  category: '',
  price: '0',
  quantity: '0',
  description: ''
});

onMounted(() => {
  onSnapshot(collection(db, 'products'), (snap) => {
    products.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
    filteredProducts.value = products.value;
  });
});

const filterProducts = () => {
  filteredProducts.value = products.value.filter(p =>
    p.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
};

const saveProduct = async () => {
  const cleanedProduct = {
    name: newProduct.value.name.trim(),
    category: newProduct.value.category.trim(),
    price: Number(newProduct.value.price),
    quantity: Number(newProduct.value.quantity),
    description: newProduct.value.description.trim(),
    createdAt: new Date()
  };

  if (!cleanedProduct.name || !cleanedProduct.category || !cleanedProduct.description) {
    alert('Please fill in the product name, category, and description.');
    return;
  }

  if (Number.isNaN(cleanedProduct.price) || Number.isNaN(cleanedProduct.quantity)) {
    alert('Price and quantity must be valid numbers.');
    return;
  }

  isSaving.value = true;
  try {
    await addDoc(collection(db, 'products'), cleanedProduct);
  } catch (error) {
    console.error('Unable to save product:', error);
    alert('Could not save the product. Please try again.');
    return;
  } finally {
    isSaving.value = false;
  }
  
  newProduct.value = {
    name: '',
    category: '',
    price: '0',
    quantity: '0',
    description: ''
  };
  alert('Product added successfully!');
};

</script>

<style scoped>
.page-logo { border-radius: 9px; height: 32px; margin-left: 12px; width: 32px; }
.native-input,
.native-textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fff;
  font: inherit;
  box-sizing: border-box;
}

.native-textarea {
  resize: vertical;
  min-height: 80px;
}

.add-card { border: 1px solid #e4e7ec; box-shadow: 0 8px 24px rgba(16, 24, 40, .06); }
.add-card { --background: #ffffff; border: 1px solid #e5eaf3; border-radius: 20px; box-shadow: 0 12px 26px rgba(24, 46, 89, .08); }.add-card ion-card-title { color: #101b33; font-size: 1.25rem; }.add-card ion-card-header::before { color: #1769ff; content: 'NEW INVENTORY'; display: block; font-size: .68rem; font-weight: 800; letter-spacing: .12em; margin-bottom: 6px; }.add-card ion-item { --background: transparent; --border-color: #edf0f5; --padding-start: 0; --inner-padding-end: 0; }.native-input, .native-textarea { background: #f8faff; border-color: #d9e2f0; color: #15233d; margin: 7px 0 10px; outline-color: #1769ff; }.inventory-list { background: transparent; border-radius: 18px; overflow: hidden; }.inventory-list ion-item { --background: #ffffff; --border-color: #edf0f5; --padding-bottom: 7px; --padding-top: 7px; margin-bottom: 2px; }.inventory-list h2 { color: #15233d; font-size: .98rem; font-weight: 750; }.inventory-list p { color: #65718a; font-size: .82rem; margin: 4px 0 7px; }
</style>