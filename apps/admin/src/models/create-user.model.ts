export interface createApiUser {
    
         status : string,
         user : {
             _id : {
                 $oid : string
            },
             first_name : string,
             last_name : string,
             cell_phone : null,
             cellphone_verify :  boolean,
             cellphone_verify_time : null,
             cellphone_reverify :  boolean,
             email_comm :  boolean,
             sms_comm : boolean,
             first_dnd_popup_time : null,
             type : string,
             profile : {
                 iid : string,
                 pager_number :string,
                 iname : string,
                 ishort : string
            },
             image_id : string,
             status : {
                 s : string,
                 is_signed_out :  boolean
            },
             email : string,
             journal_id : 0,
             has_password :  boolean,
             is_temp_password :  boolean,
             is_initial_password :  boolean,
             auto_schedule :string,
             inst_migrating :  boolean,
             uid : {
                 id : string,
                 iid : string
            },
             has_pin :  boolean,
             num_good_logins : 0,
             num_bad_logins : 0,
             time_created : {
                 $date : 1699457255693
            },
            site: {},
            can_send_activation_email:  boolean,
             wowos : {},
             legal_agreement : {
                 document : string,
                 iid : string,
                 version : string,
                 is_complete :  boolean
            },
             api_key : string,
             notification_token : null
        }
        message?:string
        error:string
  }

  export interface createUser {
    
         status :  string ,
         user : {
             _id : {
                 $oid :  string 
            },
             first_name :  string ,
             last_name :  string ,
             cell_phone : string,
             cellphone_verify : boolean ,
             cellphone_verify_time : null,
             cellphone_reverify : boolean ,
             email_comm : boolean ,
             sms_comm : boolean ,
             first_dnd_popup_time : null,
             type :  string ,
             profile : {
                 dept :  string ,
                 iid :  string ,
                 title :  string ,
                 pager_number :  string ,
                 iname :  string ,
                 ishort :  string 
            },
             image_id :  string ,
             status : {
                 s :  string ,
                 is_signed_out : boolean
            },
             email : string ,
             journal_id : 0,
             has_password : boolean ,
             is_temp_password : boolean ,
             is_initial_password : boolean ,
             has_reset_token : boolean ,
             auto_schedule :  string ,
             inst_migrating : boolean ,
             uid : {
                 id :  string ,
                 iid : string
            },
             has_pin : boolean ,
             num_good_logins : 0,
             num_bad_logins : 0,
             time_created : {
                 $date : 1700563018057
            },
             site : {},
             can_send_activation_email : boolean ,
             wowos : {},
             legal_agreement : {
                 document :  string ,
                 iid :  string ,
                 version :  number ,
                 is_complete : boolean 
            },
             notification_token : null
        },
         temp_password : string  
         message:string
         error:string
  }

  export interface UserUpdateTag{
     status :  string ,
     user : {
         _id :  string ,
         first_name :  string ,
         last_name :  string ,
         cell_phone : null,
         cellphone_verify : boolean ,
         cellphone_verify_time : null,
         cellphone_reverify : boolean ,
         email_comm : boolean ,
         sms_comm : boolean ,
         first_dnd_popup_time : null,
         type :  string ,
         profile : {
             dept :  string ,
             iid :  string ,
             title :  string ,
             pager_number : string  ,
             iname :  string ,
             ishort :  string 
        },
         image_id :  string ,
         status : {
             s :  string ,
             is_signed_out : boolean 
        },
         email :  string ,
         journal_id : 0,
         has_password : boolean ,
         is_temp_password : boolean ,
         is_initial_password : boolean ,
         has_reset_token : boolean ,
         auto_schedule :  string ,
         inst_migrating : boolean ,
         uid : {
             id :  string ,
             iid :  string 
        },
         has_pin : boolean ,
         num_good_logins : 0,
         num_bad_logins : 0,
         time_created :  Date ,
         site : {},
         can_send_activation_email : boolean ,
         wowos : {},
         legal_agreement : {
             document :  string ,
             iid :  string ,
             version :  number ,
             is_complete : boolean 
        },
         tags : [
            string
        ],
         notification_token : null
    }
    message:string
    error:string
}

export enum ViewType {
    List = "list-view",
    FreeText = "freeText-view",
  }

  export enum CreateUserType {
    CreateUser = "create-user",
    ApiUser = "api-user",
  }