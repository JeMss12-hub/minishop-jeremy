<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <img slot="start" src="/logo.svg" alt="Mini Shop logo" class="page-logo" />
        <ion-title>Manage Products</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <section class="page-intro">
        <p>PRODUCT CATALOGUE</p><h1>Manage your inventory</h1>
        <span>{{ products.length }} product{{ products.length === 1 ? '' : 's' }} in your shop</span>
      </section>
      <ion-card v-if="editingProduct" class="edit-card">
        <ion-card-header><ion-card-title>Edit {{ editingProduct.name }}</ion-card-title></ion-card-header>
        <ion-card-content>
          <ion-item><ion-label position="stacked">Product name</ion-label><input v-model="editForm.name" class="native-input" /></ion-item>
          <ion-item><ion-label position="stacked">Category</ion-label><input v-model="editForm.category" class="native-input" /></ion-item>
          <ion-item><ion-label position="stacked">Price</ion-label><input v-model="editForm.price" type="number" min="0" class="native-input" /></ion-item>
          <ion-item><ion-label position="stacked">Quantity</ion-label><input v-model="editForm.quantity" type="number" min="0" class="native-input" /></ion-item>
          <ion-item><ion-label position="stacked">Replace product image</ion-label><input type="file" accept="image/*" class="file-input" @change="selectEditImage" /></ion-item>
          <img v-if="editImagePreview || editingProduct.imageUrl" :src="editImagePreview || editingProduct.imageUrl" alt="Product image preview" class="image-preview" />
          <ion-item><ion-label position="stacked">Description</ion-label><textarea v-model="editForm.description" rows="3" class="native-input" /></ion-item>
          <ion-button expand="block" class="ion-margin-top" :disabled="isUpdating" @click="updateProduct">{{ isUpdating ? 'Saving product…' : 'Save Changes' }}</ion-button>
          <ion-button expand="block" fill="clear" @click="editingProduct = null">Cancel</ion-button>
        </ion-card-content>
      </ion-card>
      <ion-list v-if="products.length > 0" class="product-list">
        <ion-item v-for="product in products" :key="product.id">
          <ion-thumbnail slot="start" class="product-image"><img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" /><div v-else class="image-placeholder">No image</div></ion-thumbnail>
          <ion-label><h2>{{ product.name }}</h2><p>{{ product.category }} · ₱{{ product.price }}</p><ion-badge :color="product.quantity === 0 ? 'danger' : product.quantity < 5 ? 'warning' : 'success'">{{ product.quantity }} in stock</ion-badge></ion-label>
          <div slot="end" class="actions"><ion-button fill="clear" @click="startEdit(product)">Edit</ion-button><ion-button fill="clear" color="danger" @click="deleteProduct(product)">Delete</ion-button></div>
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium"><p class="empty-state">No products yet. Add your first product from the Inventory tab.</p></ion-text>
      <!--
      <ion-list v-if="cartItems.length > 0">
        <ion-item v-for="item in cartItems" :key="item.productId">
          <ion-label>
            <h2>{{ item.productName }}</h2>
            <p>₱{{ item.price }} × {{ item.quantity }}</p>
          </ion-label>
          <ion-note slot="end">₱{{ item.subtotal }}</ion-note>
        </ion-item>
      </ion-list>
      <ion-text v-else color="medium">
        <p>Your cart is empty.</p>
      </ion-text>
      <ion-card v-if="cartItems.length > 0">
        <ion-card-content>
          <h3>Total: ₱{{ total }}</h3>
        </ion-card-content>
      </ion-card>
      -->
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
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Product } from '../models/product';

const products = ref<Product[]>([]);
const editingProduct = ref<Product | null>(null);
const editForm = ref({ name: '', category: '', price: '0', quantity: '0', description: '' });
const editImage = ref<File | null>(null);
const editImagePreview = ref('');
const isUpdating = ref(false);

onMounted(() => onSnapshot(collection(db, 'products'), (snapshot) => {
  products.value = snapshot.docs.map(item => ({ id: item.id, ...item.data() })) as Product[];
}));

const startEdit = (product: Product) => {
  editingProduct.value = product;
  editImage.value = null;
  editImagePreview.value = '';
  editForm.value = { name: product.name, category: product.category, price: String(product.price), quantity: String(product.quantity), description: product.description };
};

const selectEditImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  if (file && file.size > 500 * 1024) {
    alert('Choose an image smaller than 500 KB when storing it in Firestore.');
    (event.target as HTMLInputElement).value = '';
    editImage.value = null;
    editImagePreview.value = '';
    return;
  }
  editImage.value = file;
  editImagePreview.value = file ? URL.createObjectURL(file) : '';
};

const imageToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

const updateProduct = async () => {
  if (!editingProduct.value?.id) return;
  const name = editForm.value.name.trim();
  const category = editForm.value.category.trim();
  const description = editForm.value.description.trim();
  const price = Number(editForm.value.price);
  const quantity = Number(editForm.value.quantity);
  if (!name || !category || !description || !Number.isFinite(price) || !Number.isFinite(quantity) || price < 0 || quantity < 0) {
    alert('Complete all fields with valid non-negative price and quantity.');
    return;
  }
  isUpdating.value = true;
  try {
    const imageUrl = editImage.value ? await imageToDataUrl(editImage.value) : editingProduct.value.imageUrl || '';
    await updateDoc(doc(db, 'products', editingProduct.value.id), { name, category, description, price, quantity, imageUrl });
    editingProduct.value = null;
    editImage.value = null;
    editImagePreview.value = '';
  } catch (error) {
    console.error('Unable to update product image:', error);
    alert('Could not save the image in Firestore. Try a smaller image.');
  } finally {
    isUpdating.value = false;
  }
};

const deleteProduct = async (product: Product) => {
  if (!product.id || !confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
  await deleteDoc(doc(db, 'products', product.id));
  if (editingProduct.value?.id === product.id) editingProduct.value = null;
};
</script>

<style scoped>
.page-logo { border-radius: 9px; height: 32px; margin-left: 12px; width: 32px; }
.page-intro { padding: 18px 8px 22px; }.page-intro p { color: #1769ff; font-size: .7rem; font-weight: 800; letter-spacing: .13em; margin: 0 0 7px; }.page-intro h1 { color: #101b33; font-size: 1.8rem; letter-spacing: -.035em; margin: 0 0 6px; }.page-intro span { color: #667085; }.edit-card, .product-list { border: 1px solid #e1e8f2; border-radius: 20px; }.edit-card { --background: #fff; box-shadow: 0 12px 26px rgba(24,46,89,.09); }.edit-card ion-item { --background: transparent; --border-color: #edf0f5; --padding-start: 0; --inner-padding-end: 0; }.product-list { background: #fff; box-shadow: 0 8px 21px rgba(24,46,89,.05); overflow: hidden; }.product-list ion-item { --background: #fff; --border-color: #edf0f5; --padding-bottom: 7px; --padding-top: 7px; }.product-list h2 { color: #15233d; font-size: .98rem; font-weight: 750; }.product-list p { color: #65718a; font-size: .82rem; margin: 4px 0 7px; }.actions { display: flex; }.actions ion-button { font-size: .75rem; }.native-input { background: #f8faff; border: 1px solid #d9e2f0; border-radius: 10px; color: #15233d; margin: 7px 0 10px; outline-color: #1769ff; padding: 10px; box-sizing: border-box; font: inherit; width: 100%; }.file-input { padding: 12px 0; width: 100%; }.image-preview { border: 1px solid #e4e7ec; border-radius: 14px; box-shadow: 0 8px 18px rgba(16,27,51,.12); display: block; height: 160px; margin: 12px auto 0; object-fit: cover; width: 100%; }.product-image { --border-radius: 13px; --size: 62px; box-shadow: 0 4px 11px rgba(15,23,42,.12); }.product-image img { height: 100%; object-fit: cover; width: 100%; }.image-placeholder { align-items: center; background: #eef3fb; color: #667085; display: flex; font-size: .65rem; height: 100%; justify-content: center; text-align: center; }.empty-state { color: #65718a; padding: 56px 20px; text-align: center; }
</style>
