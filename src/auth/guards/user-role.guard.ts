import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

import { ROLES_KEY } from "../decorators/role-protected.decorator";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class UserRoleGuard implements CanActivate{

    constructor(
        private readonly reflector:Reflector
    ){

    }
 canActivate(
    context: ExecutionContext,
 ): boolean | Promise<boolean> | Observable<boolean>{

       //get the array valid roles
       const validRoles:string[] = this.reflector.get(ROLES_KEY,context.getHandler());
        
       //verify the required roles
       if(!validRoles) return true;
       if(validRoles.length === 0) return true;

       //recover user from the request
       const req = context.switchToHttp().getRequest();
       const user = req.user as User;

       //validate if user exists
        if(!user)
        throw new BadRequestException(`User not Found`);

        //iterate over the user's roles and check if any of those roles are in the list of valid roles for the route
        for(const role of user.roles){
            if( validRoles.includes(role)){
                return true;
            }
        }  

        //return error if not a valid rol
        throw new ForbiddenException(`
        User ${user.name} need a valid role: [${validRoles}]`);
    }

} 