from django.urls import path
from rest_framework_simplejwt.views import (TokenRefreshView)
from . import views

urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(),name="token-obtain"),
    path('token/refresh/', TokenRefreshView.as_view(), name="refresh-token"),
    path('register/', views.RegisterView.as_view(), name="register-user"),
    path('test/', views.protectedView, name="test"),
    path('', views.view_all_routes, name="all-routes"),
    path('login/', views.LoginView.as_view(), name="login-user"),
    path('logout/', views.LogoutView.as_view(), name='logout-user'),
    path('blog/', views.BlogPostListCreateView.as_view(), name='blog-post-list'),
    path('blog-posts/<int:pk>/', views.BlogPostDetailView.as_view(), name='blog-post-detail'),
    path('blog-posts/<int:pk>/update/',views.BlogPostUpdateView.as_view(), name='blog-post-update'),
    path('blog-posts/<int:pk>/delete/',views.BlogPostDeleteView.as_view(), name='blog-post-delete'),
    path('comments/', views.CommentListCreateView.as_view(), name='comment-list-create'),
    path('blog-posts/<int:pk>/comments/', views.BlogPostCommentView.as_view(), name='blogpost-comments'),

    path('password_reset/',views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset_confirm/<uidb64>/<token>/',views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
   
    
]