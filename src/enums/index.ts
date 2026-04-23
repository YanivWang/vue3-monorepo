/** 主题模式 */
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

/** 语言类型 */
export enum Language {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US'
}

/** 本地存储 Key */
export enum StorageKey {
  TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
  SIDEBAR = 'sidebar_collapsed',
  THEME = 'theme_mode',
  LANGUAGE = 'language'
}

/** 请求状态码 */
export enum RequestCode {
  SUCCESS = 200,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500
}

/** 权限控制模式 */
export enum PermissionMode {
  /** 基于角色 */
  ROLE = 'role',
  /** 基于权限码 */
  PERMISSION = 'permission'
}

/** 菜单类型 */
export enum MenuType {
  /** 目录 */
  DIRECTORY = 'directory',
  /** 菜单 */
  MENU = 'menu',
  /** 按钮 */
  BUTTON = 'button'
}

/** Tab 操作类型 */
export enum TabAction {
  CLOSE = 'close',
  CLOSE_OTHERS = 'closeOthers',
  CLOSE_ALL = 'closeAll',
  REFRESH = 'refresh'
}
