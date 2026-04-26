import type zhCN from './zh-CN'

const enUS: typeof zhCN = {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    reset: 'Reset',
    add: 'Add',
    export: 'Export',
    import: 'Import',
    loading: 'Loading...',
    success: 'Success',
    failed: 'Failed',
    noData: 'No Data',
    total: 'Total {total}',
    yes: 'Yes',
    no: 'No',
    enable: 'Enable',
    disable: 'Disable',
    refresh: 'Refresh',
    more: 'More',
    detail: 'Detail',
    operate: 'Action',
    status: 'Status',
    remark: 'Remark',
    createdAt: 'Created At',
    updatedAt: 'Updated At'
  },
  menu: {
    home: 'Home',
    system: 'System',
    user: 'User Management',
    role: 'Role Management',
    permission: 'Permission Management',
    menu: 'Menu Management',
    dept: 'Department Management',
    log: 'Operation Log'
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    captcha: 'Captcha',
    rememberMe: 'Remember Me',
    loginSuccess: 'Login Successful',
    logoutSuccess: 'Logout Successful',
    logoutConfirm: 'Are you sure you want to logout?',
    loginExpired: 'Your session has expired, please login again.',
    reLogin: 'Re-Login',
    noPermission: 'Please login first'
  },
  error: {
    '403': 'You do not have permission to access this page',
    '404': 'The page you are looking for does not exist',
    '500': 'Internal Server Error',
    network: 'Network error, please check your connection',
    timeout: 'Request timeout, please try again later',
    unknown: 'Unknown error',
    dataFormat: 'Response data format error'
  },
  tabs: {
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All',
    refresh: 'Refresh Current'
  },
  http: {
    noPermission: 'No permission to access this resource',
    notFound: 'The requested resource does not exist',
    serverError: 'Internal server error, please try again later'
  }
}

export default enUS
