import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @ApiProperty({
        example:'0ea31cf0-8283-4661-bb6e-774f6f095e55',
        description: 'User ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @ApiProperty({
        example:'testname@email.com',
        description: 'User Email',
        uniqueItems: true
    })
    @Column('text',{
        unique:true
    })
    email:string;

    @ApiProperty({
        example:'Abc123',
        description: 'User Password',
    })
    @Column('text',{
        select:false
    })
    password:string;

    @ApiProperty({
        example:'testName',
        description: 'User Name',
    })
    @Column('text')
    name: string;

    @ApiProperty({
        example:'true',
        description: 'User Status in Database',
        default: true
    })
    @Column('bool',{
        default:true
    })
    isActive:boolean;

    @ApiProperty({
        example:['admin','sales'],
        description: 'User Roles',
        default:['user']
    })
    @Column('text',{
        array:true,
        default:['user']
    })
    roles:string[];
}
