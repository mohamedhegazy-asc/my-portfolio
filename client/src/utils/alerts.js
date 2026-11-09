import Swal from 'sweetalert2'

// Dark themed alert matching the website tokens (--ink #222936, --sage #B9D895, --mint #E0F6C4)
export const DarkSwal = Swal.mixin({
  background: '#222936',
  color: '#E0F6C4',
  confirmButtonColor: '#B9D895',
  cancelButtonColor: '#374159',
  customClass: {
    popup: 'rounded-[20px] border border-[#374159] shadow-2xl',
    confirmButton: 'text-[#222936] font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer',
    cancelButton: 'text-white font-semibold px-5 py-2.5 rounded-xl shadow-md cursor-pointer',
    title: 'font-serif font-bold text-white',
    htmlContainer: 'text-sm text-[#E0F6C4]/80'
  }
})

// Light themed alert matching the Admin Dashboard
export const LightSwal = Swal.mixin({
  background: '#FFFFFF',
  color: '#1E232F',
  confirmButtonColor: '#222936',
  cancelButtonColor: '#E5E7EB',
  customClass: {
    popup: 'rounded-[20px] border border-[#E7E9ED] shadow-xl',
    confirmButton: 'text-white font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer',
    cancelButton: 'text-[#1E232F] font-semibold px-5 py-2.5 rounded-xl border border-gray-300 cursor-pointer',
    title: 'font-sans font-bold text-[#1E232F]',
    htmlContainer: 'text-xs text-gray-600'
  }
})

// Toast notification (auto-dismiss)
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#222936',
  color: '#E0F6C4',
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  }
})

export const showSuccessToast = (title) => {
  return Toast.fire({
    icon: 'success',
    title
  })
}

export const showErrorToast = (title) => {
  return Toast.fire({
    icon: 'error',
    title
  })
}

// Confirmation Dialog for Admin operations (Delete project/article)
export const confirmDeletion = async (itemTitle) => {
  const result = await LightSwal.fire({
    title: 'Are you sure?',
    text: `You are about to delete "${itemTitle}". This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    reverseButtons: true
  })
  return result.isConfirmed
}

