import Swal from 'sweetalert2';

export const useAlert = () => {
  const showSuccess = (message, title = '¡Éxito!') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'success',
      title: title,
      text: message
    });
  };

  const showError = (message, title = 'Error') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'error',
      title: title,
      text: message
    });
  };

  const showConfirm = async (message, title = '¿Estás seguro?') => {
    const result = await Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      reverseButtons: true,
      customClass: {
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      },
      didOpen: () => {
        // Forzar estilos de botones
        const confirmBtn = document.querySelector('.swal-confirm-btn');
        const cancelBtn = document.querySelector('.swal-cancel-btn');
        
        if (confirmBtn) {
          confirmBtn.style.cssText = 'background-color: #dc2626 !important; color: white !important; border: none !important; padding: 10px 20px !important; margin: 0 5px !important; border-radius: 6px !important; font-weight: 500 !important; cursor: pointer !important;';
        }
        
        if (cancelBtn) {
          cancelBtn.style.cssText = 'background-color: #6b7280 !important; color: white !important; border: none !important; padding: 10px 20px !important; margin: 0 5px !important; border-radius: 6px !important; font-weight: 500 !important; cursor: pointer !important;';
        }
      }
    });

    return result.isConfirmed;
  };

  return {
    showSuccess,
    showError,
    showConfirm
  };
};