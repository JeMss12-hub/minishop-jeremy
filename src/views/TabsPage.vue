<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="products" href="/tabs/products">
          <ion-icon :icon="cubeOutline" />
          <ion-label>Inventory</ion-label>
        </ion-tab-button> 
        <ion-tab-button tab="cart" href="/tabs/cart">
          <ion-icon :icon="settingsOutline" />
          <ion-label>Manage</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="sales" href="/tabs/sales">
          <ion-icon :icon="receiptOutline" />
          <ion-label>Sales</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { homeOutline, cubeOutline, settingsOutline, receiptOutline } from 'ionicons/icons';
</script>

<style scoped>
ion-tab-bar { --background: #101b33; --border: 0; border-radius: 22px 22px 0 0; box-shadow: 0 -8px 28px rgba(15, 23, 42, .14); display: flex; padding: 7px 4px max(7px, env(safe-area-inset-bottom)); }
ion-tab-button { --background: transparent; --color: #94a3b8; --color-selected: #7dd3fc; --ripple-color: #38bdf8; flex: 1; min-height: 54px; }
ion-tab-button::part(native) { border-radius: 14px; }
</style>
