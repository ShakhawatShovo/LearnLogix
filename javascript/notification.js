// Notification system - add to your script
function showNotification(type, message, duration = 5000) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-triangle',
      warning: 'exclamation-circle'
    };
  
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${icons[type]}"></i>
      <span>${message}</span>
      <span class="notification-close">&times;</span>
    `;
  
    document.body.appendChild(notification);
  
    // Trigger the animation
    setTimeout(() => notification.classList.add('show'), 10);
  
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
      closeNotification(notification);
    });
  
    // Auto-close after duration
    if (duration) {
      setTimeout(() => closeNotification(notification), duration);
    }
  }
  
  function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }