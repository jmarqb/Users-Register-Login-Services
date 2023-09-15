interface SeedUser {
    email: string;
    name: string;
    password: string;
    roles: string[];
}

interface SeedData {
    users: SeedUser[]
}

export const initialData: SeedData = {
    users: [
        {
            email: 'test1@google.com',
            name: 'Test One',
            password: 'Abc123',
            roles: ['admin'],
        },
        {
            email: 'test2@google.com',
            name: 'Test Two',
            password: 'Abc123',
            roles: ['user'],
        },
        {
            email: 'test3@google.com',
            name: 'Test Three',
            password: 'Abc123',
            roles: ['user'],
        },
        {
            email: 'test4@google.com',
            name: 'Test Four',
            password: 'Abc123',
            roles: ['user'],
        },
        {
            email: 'test5@google.com',
            name: 'Test Five',
            password: 'Abc123',
            roles: ['user'],
        },
        {
            email: 'test6@google.com',
            name: 'Test Six',
            password: 'Abc123',
            roles: ['user'],
        },
        {
            email: 'test7@google.com',
            name: 'Test Seven',
            password: 'Abc123',
            roles: ['user'],
        },
        {
            email: 'test8@google.com',
            name: 'Test Eight',
            password: 'Abc123',
            roles: ['user'],
        },
        {
            email: 'test9@google.com',
            name: 'Test Nine',
            password: 'Abc123',
            roles: ['user'],
        },
        {
            email: 'test10@google.com',
            name: 'Test Ten',
            password: 'Abc123',
            roles: ['user'],
        },
        {
            email: 'test11@google.com',
            name: 'Test Eleven',
            password: 'Abc123',
            roles: ['user'],
        },
    ]
}