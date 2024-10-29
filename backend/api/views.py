from django.shortcuts import render
from django.core.exceptions import PermissionDenied
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.exceptions import NotFound
from django.contrib.auth.tokens import default_token_generator
# from django.contrib.sites.shortcuts import get_current_site
from .models import User
# Create your views here.
import logging
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from .serializers import MyTOPS, RegistrationSerializer,LoginSerializer,LogoutSerializer
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated , IsAuthenticatedOrReadOnly
from rest_framework import status
from rest_framework.serializers import Serializer, CharField
from .serializers import*

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTOPS

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protectedView(request):
    output = f"Welcome {request.user}, Authentication SUccessful"
    return Response({'response':output}, status=status.HTTP_200_OK)

@api_view(['GET'])
def view_all_routes(request):
    data = [
        'api/token/refresh/',
        'api/register/',
        'api/token/'
    ]

    return Response(data)


class LoginView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)  # Token generation
        
        return Response({
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_200_OK)
    

        

class PasswordResetView(APIView):
    permission_classes = [AllowAny]  

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email address is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            user_id = urlsafe_base64_encode(force_bytes(user.pk))
           
            # Construct the password reset URL
            reset_url = f"http://127.0.0.1:3000/password-reset-confirm/{user_id}/{token}/"


            
            send_mail(
                'Password Reset',
                f'Click the link to reset your password: {reset_url}',
                'from@example.com',  
                [user.email],
                fail_silently=False,
            )
            return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({"error": "User with this email address does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]  
    def post(self, request, uidb64, token):
        password = request.data.get('password')
        if not password:
            return Response({"error": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id)
            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)




    
class LogoutView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = LogoutSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"detail": "Logout successful"}, status=status.HTTP_204_NO_CONTENT)
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 100





class BlogPostListCreateView(generics.ListCreateAPIView):
    queryset = BlogPost.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateBlogSerializer
        return BlogPostSerializer

    # Remove perform_create method

    # Keep create method only if you need the print statements for debugging
    def create(self, request, *args, **kwargs):
        print("Request data:", self.request.data)
        print("User:", request.user)
        return super().create(request, *args, **kwargs)



class BlogPostDetailView(generics.RetrieveAPIView):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'pk' 

    def get_object(self):
        try:
            obj = super().get_object()
            return obj
        except BlogPost.DoesNotExist:
            raise NotFound("Blog post not found")
        

class BlogPostUpdateView(generics.UpdateAPIView):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_object(self):
        obj = super().get_object()
        # Check if the user is the author of the post
        if obj.author != self.request.user:
            raise PermissionDenied("You don't have permission to edit this post")
        return obj

    def perform_update(self, serializer):
        # You can add additional logic here before saving
        serializer.save(last_modified_by=self.request.user)

class BlogPostDeleteView(generics.DestroyAPIView):
    queryset = BlogPost.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_object(self):
        obj = super().get_object()
        print(f"Request user: {self.request.user}, Post author: {obj.author}")
        if obj.author != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You don't have permission to delete this post")
        return obj

    def perform_destroy(self, instance):
        # You can add additional logic here before deletion
        # For example, logging the deletion
        print(f"Deleting blog post {instance.id} by user {self.request.user}")
        instance.delete()





class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        blog_post_id = self.request.query_params.get('blog_post')

        if not blog_post_id:
            raise serializers.ValidationError({"blog_post": "Blog post ID is required in query parameters."})

        blog_post = get_object_or_404(BlogPost, id=blog_post_id)

        return Comment.objects.filter(blog_post=blog_post)

    def perform_create(self, serializer):
        blog_post_id = self.request.data.get('blog_post')
        
        blog_post = get_object_or_404(BlogPost, id=blog_post_id)
        serializer.save(user=self.request.user, blog_post=blog_post)


class BlogPostCommentView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        blog_post_id = self.kwargs['pk'] 
        blog_post = get_object_or_404(BlogPost, id=blog_post_id)  
        return Comment.objects.filter(blog_post=blog_post)  
    def perform_create(self, serializer):
        blog_post_id = self.kwargs['pk']  
        blog_post = get_object_or_404(BlogPost, id=blog_post_id) 

        # Associate the new comment with the blog post and the logged-in user
        serializer.save(user=self.request.user, blog_post=blog_post)