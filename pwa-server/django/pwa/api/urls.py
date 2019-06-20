from django.urls import path

from . import views

urlpatterns = [
    path('api/', views.api),
    path('product/<str:sku>', views.product),
    path('price/<str:sku>', views.price),
    path('products/', views.products),
    path('save_token/', views.save_token),
    path('set_mode/', views.set_mode),
    path('send_notification/', views.send_notification),
    path('send_order_notification/', views.send_order_notification),
    path('send_promo_notification/', views.send_promo_notification),
    path('send_promo_notification2/', views.send_promo_notification2),
]
