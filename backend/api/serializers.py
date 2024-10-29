from rest_framework_simplejwt.tokens import Token
from .models import*
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class MyTOPS(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['full_name'] = user.profile.full_name
        token['username'] = user.username
        token['email'] = user.email
        token['bio'] = user.profile.bio

        return token
    

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'username', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password':"Password Fields Didn't Match"}
            )
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])

        user.save()

        if "full_name" in validated_data:
            user.profile.full_name = validated_data['full_name']
            user.profile.save()

        return user
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(email=email, password=password)

            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        data['user'] = user
        return data
    
class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)
    uid = serializers.CharField()
    token = serializers.CharField()

    def validate(self, data):
        uid = data.get('uid')
        token = data.get('token')
        new_password = data.get('new_password')

        try:
            # Decode the user ID
            uid_decoded = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid_decoded)
        except (User.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError('Invalid user.')

        # Check if the token is valid for the user
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError('Invalid or expired token.')

        # You can add additional password validation here if needed
        # e.g., checking for password strength, special characters, etc.

        data['user'] = user
        return data

    def save(self):
        # Get the validated user and new password
        user = self.validated_data['user']
        new_password = self.validated_data['new_password']

        # Set the new password and save
        user.set_password(new_password)
        user.save()
        return user

    
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        from rest_framework_simplejwt.tokens import RefreshToken
        try:
            # Blacklist the token to invalidate it
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception as e:
            self.fail('bad_token')


# class CommentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Comment
#         fields = ['id', 'content', 'blog_post', 'user']

#     def create(self, validated_data):
#         return Comment.objects.create(**validated_data)

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'blog_post', 'content']  
        read_only_fields = ['user'] 


class BlogPostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')  
    comments = CommentSerializer(many=True, read_only=True)  

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'content', 'image', 'author', 'created_at', 'comments']  

class CreateBlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['title', 'content', 'image' ]

    def validate_image(self, value):
        if not value:
            raise serializers.ValidationError("Image is required for creating a blog post.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        return BlogPost.objects.create(author=request.user, **validated_data)
        return BlogPost.objects.create(**validated_data)
    

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user is associated with this email.")
        return value



class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    
    



