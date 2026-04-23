/**
 * ⚠️  此文件由 scripts/gen-api.ts 自动生成，请勿手动修改
 * 修改 openapi/api.yaml 后执行 pnpm run gen:api 重新生成
 */

export interface paths {
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 用户登录 */
        post: operations["authLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 用户登出 */
        post: operations["authLogout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 刷新 Token */
        post: operations["authRefresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/info": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取当前用户信息 */
        get: operations["getUserInfo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取用户列表 */
        get: operations["getUserList"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/menu/list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 获取当前用户菜单 */
        get: operations["getMenuList"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ApiResponse: {
            /** @example 200 */
            code: number;
            /** @example success */
            message: string;
            /** @description 业务数据，类型因接口而异 */
            data?: unknown;
        };
        LoginParams: {
            /** @example admin */
            username: string;
            /**
             * Format: password
             * @example 123456
             */
            password: string;
        };
        LoginResult: {
            code?: number;
            message?: string;
            data?: {
                accessToken?: string;
                refreshToken?: string;
                /** @description Token 有效期（秒） */
                expiresIn?: number;
            };
        };
        UserInfo: {
            id: number;
            username: string;
            nickname?: string;
            /** Format: uri */
            avatar?: string;
            /** Format: email */
            email?: string;
            phone?: string;
            roles: string[];
            permissions?: string[];
        };
        PaginationResult: {
            list?: unknown[];
            total?: number;
            page?: number;
            pageSize?: number;
        };
        MenuItem: {
            id?: number;
            parentId?: number | null;
            name?: string;
            path?: string;
            component?: string;
            redirect?: string;
            icon?: string;
            title?: string;
            sort?: number;
            hidden?: boolean;
            children?: components["schemas"]["MenuItem"][];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    authLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginParams"];
            };
        };
        responses: {
            /** @description 登录成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResult"];
                };
            };
        };
    };
    authLogout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 登出成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiResponse"];
                };
            };
        };
    };
    authRefresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    refreshToken?: string;
                };
            };
        };
        responses: {
            /** @description Token 刷新成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResult"];
                };
            };
        };
    };
    getUserInfo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiResponse"] & {
                        data?: components["schemas"]["UserInfo"];
                    };
                };
            };
        };
    };
    getUserList: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                keyword?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiResponse"] & {
                        data?: components["schemas"]["PaginationResult"];
                    };
                };
            };
        };
    };
    getMenuList: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description 成功 */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiResponse"] & {
                        data?: components["schemas"]["MenuItem"][];
                    };
                };
            };
        };
    };
}
