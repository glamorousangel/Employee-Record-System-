from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Application, ApplicationStatusHistory
from .forms import ApplicationActionForm, PositionChangeRequestForm

@login_required
def application_list(request):
    user = request.user
    # Role checks as per requirements
    if user.role in ['HR', 'SD']:
        applications = Application.objects.all()
    elif user.role == 'HEAD':
        applications = Application.objects.filter(target_department=user.department)
    else:
        applications = Application.objects.none()
        
    return render(request, 'application_management/hr_appmanagement.html', {'applications': applications})

@login_required
def application_detail(request, pk):
    application = get_object_or_404(Application, pk=pk)
    # Fetch history related to this application
    history = application.history.all().order_by('-timestamp')
    
    form = None
    # Instantiate the form for HR or Head roles
    if request.user.role in ['HR', 'HEAD']:
        form = ApplicationActionForm()
        
    return render(request, 'application/application_info.html', {
        'application': application,
        'history': history,
        'form': form,
    })

@login_required
def process_application_action(request, pk):
    application = get_object_or_404(Application, pk=pk)
    
    if request.method == 'POST' and request.user.role in ['HR', 'HEAD']:
        form = ApplicationActionForm(request.POST)
        if form.is_valid():
            decision = form.cleaned_data['decision']
            remarks = form.cleaned_data['remarks']
            
            old_status = application.status
            new_status = old_status
            
            # Determine new status based on decision and user role
            if decision == 'Approve':
                if request.user.role == 'HEAD':
                    new_status = 'Head Approved'
                elif request.user.role == 'HR':
                    new_status = 'HR Approved'
            elif decision == 'Reject':
                new_status = 'Rejected'
            # If Forward, status might stay the same but the history will log it
                
            application.status = new_status
            application.save()
            
            # Create a history record
            ApplicationStatusHistory.objects.create(
                application=application,
                previous_status=old_status,
                new_status=new_status,
                remarks=remarks,
                actor=request.user
            )
            
            messages.success(request, f"Application action '{decision}' successfully processed.")
            return redirect('application_detail', pk=pk)
            
    return redirect('application_detail', pk=pk)

@login_required
def create_position_change(request):
    if request.method == 'POST':
        form = PositionChangeRequestForm(request.POST, request.FILES)
        if form.is_valid():
            application = form.save(commit=False)
            application.applicant_name = f"{request.user.first_name} {request.user.last_name}"
            application.type = 'Position Change Request'
            application.status = 'Pending'
            application.save()
            
            messages.success(request, 'Position change request submitted successfully.')
            return redirect('application_list')
    else:
        form = PositionChangeRequestForm()
        
    return render(request, 'employee/emp_position_change_request.html', {'form': form})
