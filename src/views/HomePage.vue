<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <img slot="start" src="/logo.svg" alt="Mini Shop logo" class="page-logo" />
        <ion-title>Mini Shop Owner<v2.0></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <section class="welcome">
        <div class="status-dot"></div><p class="eyebrow">OWNER DASHBOARD</p>
        <!-- Pinalitan ang h1 para may version label -->
        <h1>Your shop, in <span>full control.</span> <small style="font-size: 0.5em; color: #1769ff;">(v2.0)</small></h1>
        <p>Organize your electronics catalogue, maintain stock, and keep product details current.</p>
        <!-- Idinagdag na version note -->
        <p class="version-label" style="font-size: 0.75rem; color: #34d399; font-weight: 600; margin-top: 8px;">✨ Updated via CI/CD Pipeline ✨</p>
      </section>
      <section class="metric-grid" aria-label="Shop overview">
        <ion-card class="metric-card">
          <ion-card-content>
            <span class="metric-label">PRODUCTS</span>
            <strong>{{ products.length }}</strong>
            <small>in catalogue</small>
          </ion-card-content>
        </ion-card>
        <ion-card class="metric-card">
          <ion-card-content>
            <span class="metric-label">STOCK UNITS</span>
            <strong>{{ totalStock }}</strong>
            <small>available now</small>
          </ion-card-content>
        </ion-card>
        <ion-card class="metric-card accent-card">
          <ion-card-content>
            <span class="metric-label">SALES REVENUE</span>
            <strong>₱{{ totalRevenue.toFixed(2) }}</strong>
            <small>{{ sales.length }} recorded sale{{ sales.length === 1 ? '' : 's' }}</small>
          </ion-card-content>
        </ion-card>
      </section>
      <ion-card class="quick-card">
        <ion-card-header>
          <ion-card-subtitle>INVENTORY HUB</ion-card-subtitle>
          <ion-card-title>Everything your store needs</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          Add new electronics in Inventory, then update price, photos, descriptions, and stock in Manage.
        </ion-card-content>
      </ion-card>
      <section class="dashboard-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">ATTENTION NEEDED</p>
            <h2>Stock alerts</h2>
          </div>
          <ion-button fill="clear" size="small" href="/tabs/cart">Manage</ion-button>
        </div>
        <div v-if="lowStockProducts.length" class="alert-list">
          <div v-for="product in lowStockProducts" :key="product.id" class="stock-alert">
            <div>
              <strong>{{ product.name }}</strong>
              <span>{{ product.category }}</span>
            </div>
            <ion-badge :color="product.quantity === 0 ? 'danger' : 'warning'">
              {{ product.quantity === 0 ? 'Out of stock' : `${product.quantity} left` }}
            </ion-badge>
          </div>
        </div>
        <p v-else class="empty-note">Your stock levels look healthy.</p>
      </section>
      <section class="dashboard-section recent-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">RECENT ACTIVITY</p>
            <h2>Latest sales</h2>
          </div>
          <ion-button fill="clear" size="small" href="/tabs/sales">View all</ion-button>
        </div>
        <div v-if="recentSales.length" class="sale-list">
          <div v-for="sale in recentSales" :key="sale.id" class="sale-row">
            <div>
              <strong>{{ sale.productName }}</strong>
              <span>{{ sale.customerName }} · {{ sale.status }}</span>
            </div>
            <b>₱{{ sale.total.toFixed(2) }}</b>
          </div>
        </div>
        <p v-else class="empty-note">Your latest sales will appear here.</p>
      </section>
      <ion-button expand="block" href="/tabs/products">
        View Inventory
      </ion-button>
      <ion-button expand="block" fill="outline" href="/tabs/cart" class="ion-margin-top">
        Manage Products
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { db } from '../firebase/config';
import type { Product } from '../models/product';
import type { Sale } from '../models/sale';

const products = ref<Product[]>([]);
const sales = ref<Sale[]>([]);

onMounted(() => {
  onSnapshot(collection(db, 'products'), (snapshot) => {
    products.value = snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Product);
  });
  onSnapshot(collection(db, 'sales'), (snapshot) => {
    sales.value = snapshot.docs
      .map(item => ({ id: item.id, ...item.data() }) as Sale)
      .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')));
  });
});

const totalStock = computed(() => products.value.reduce((total, product) => total + Number(product.quantity || 0), 0));
const totalRevenue = computed(() => sales.value
  .filter(sale => sale.status !== 'Cancelled')
  .reduce((total, sale) => total + Number(sale.total || 0), 0));
const lowStockProducts = computed(() => products.value.filter(product => product.quantity <= 5).slice(0, 4));
const recentSales = computed(() => sales.value.slice(0, 4));
</script>

<style scoped>
.page-logo { border-radius: 9px; height: 32px; margin-left: 12px; width: 32px; }
.welcome { padding: 26px 8px 25px; }
.status-dot { background: #34d399; border: 4px solid #d1fae5; border-radius: 50%; display: inline-block; height: 8px; margin: 0 7px 1px 0; width: 8px; }
.eyebrow { color: #1769ff; display: inline-block; font-size: .7rem; font-weight: 800; letter-spacing: .14em; margin: 0 0 12px; }
h1 { color: #101b33; font-size: 2.15rem; letter-spacing: -.055em; line-height: 1.04; margin: 0 0 14px; }
h1 span { color: #1769ff; }
.welcome > p:last-child { color: #63708a; line-height: 1.6; margin: 0; }
.metric-grid { display: grid; gap: 10px; grid-template-columns: repeat(3, 1fr); margin-bottom: 22px; }
.metric-card { --background: #fff; border: 1px solid #e1e8f2; border-radius: 16px; box-shadow: 0 7px 18px rgba(24, 46, 89, .06); margin: 0; }
.metric-card ion-card-content { padding: 14px 11px; }
.metric-label { color: #73809a; display: block; font-size: .57rem; font-weight: 800; letter-spacing: .08em; white-space: nowrap; }
.metric-card strong { color: #101b33; display: block; font-size: 1.28rem; margin: 5px 0 2px; overflow: hidden; text-overflow: ellipsis; }
.metric-card small { color: #8a95a8; font-size: .67rem; }
.accent-card { --background: #eaf8ff; border-color: #bae6fd; }
.accent-card strong { color: #087ea4; }
.quick-card { --background: linear-gradient(135deg, #101b33 0%, #19376f 100%); --color: #ffffff; border: 1px solid rgba(96, 165, 250, .3); border-radius: 20px; box-shadow: 0 16px 28px rgba(16, 27, 51, .22); margin: 0 0 24px; overflow: hidden; }
.quick-card ion-card-title { color: #fff; font-size: 1.22rem; }.quick-card ion-card-subtitle { color: #7dd3fc; font-weight: 800; letter-spacing: .1em; }.quick-card ion-card-content { color: #d6e5ff; line-height: 1.55; }
.dashboard-section { margin: 26px 8px 0; }
.section-heading { align-items: end; display: flex; justify-content: space-between; }
.section-heading .eyebrow { margin-bottom: 4px; }
.section-heading h2 { color: #101b33; font-size: 1.2rem; margin: 0; }
.section-heading ion-button { --color: #1769ff; margin: 0 -10px 0 0; }
.alert-list, .sale-list { background: #fff; border: 1px solid #e1e8f2; border-radius: 16px; box-shadow: 0 7px 18px rgba(24, 46, 89, .05); margin-top: 12px; overflow: hidden; }
.stock-alert, .sale-row { align-items: center; border-bottom: 1px solid #edf0f5; display: flex; justify-content: space-between; padding: 12px 14px; }
.stock-alert:last-child, .sale-row:last-child { border-bottom: 0; }
.stock-alert strong, .sale-row strong { color: #15233d; display: block; font-size: .88rem; }
.stock-alert span, .sale-row span { color: #7b879b; display: block; font-size: .74rem; margin-top: 3px; }
.sale-row b { color: #1769ff; font-size: .85rem; }
.empty-note { background: #f7faff; border-radius: 12px; color: #73809a; font-size: .82rem; margin: 12px 0 0; padding: 16px; text-align: center; }
.recent-section { margin-bottom: 26px; }
@media (max-width: 370px) { .metric-grid { gap: 6px; }.metric-card ion-card-content { padding: 12px 8px; }.metric-card strong { font-size: 1.08rem; }.metric-label { font-size: .5rem; } }
</style>