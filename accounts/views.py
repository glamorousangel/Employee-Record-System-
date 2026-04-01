from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages

def login_view(request):
    if request.method == 'POST':
        # 1. Get the data from your form
        username_or_email = request.POST.get('username')
        password = request.POST.get('password')

        # 2. Check if the user exists and the password is correct
        user = authenticate(request, username=username_or_email, password=password)

        if user is not None:
            # 3. Create the session
            login(request, user)
            
            # Redirect based on the role you created in your Model
            if user.role == 'ADMIN':
                return redirect('admin_dashboard') # Make sure this name matches your urls.py
            else:
                return redirect('employee_dashboard')
        else:
            # 4. If it fails, show an error message
            messages.error(request, "Invalid username or password.")
            
    return render(request, 'login/login.html')

def admin_dashboard(request):
    # Change 'admin_overview.html' to 'admin_dash.html'
    return render(request, 'dashboards/admin_dash.html')

def employee_dashboard(request):
    return render(request, 'dashboards/emp_dash.html')