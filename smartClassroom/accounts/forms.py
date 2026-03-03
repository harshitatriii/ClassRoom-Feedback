from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

from .models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    role = forms.ChoiceField(choices=CustomUser.ROLE_CHOICES[:2])  # Students and Faculty only; Admin created via manage.py

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'role',
                  'department', 'enrollment_no', 'faculty_id', 'phone',
                  'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            if field_name == 'role':
                field.widget.attrs['class'] = 'form-select'
                field.widget.attrs['id'] = 'id_role'

    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')

        if role == 'student' and not cleaned_data.get('enrollment_no'):
            self.add_error('enrollment_no', 'Enrollment number is required for students.')
        if role == 'faculty' and not cleaned_data.get('faculty_id'):
            self.add_error('faculty_id', 'Faculty ID is required for faculty.')

        return cleaned_data


class CustomAuthenticationForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs['class'] = 'form-control'


class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'department', 'phone')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs['class'] = 'form-control'
