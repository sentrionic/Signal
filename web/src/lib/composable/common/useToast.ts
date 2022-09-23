interface ToastProps {
  type: 'success' | 'error';
}

export const useToast = ({ type }: ToastProps) => {
  // Get the snackbar DIV

  const id = type === 'success' ? 'success-snackbar' : 'error-snackbar';

  const snackbar = document.getElementById(id);

  if (!snackbar) return;

  // Add the "show" class to DIV
  snackbar.className += ' show';

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    if (snackbar) snackbar.className = snackbar.className.replace('show', '');
  }, 3000);
};
