export interface GetGroupResponse {
    status: string;
    group: GroupData;
    error?: string;
    message?: string;
  }

  export interface GetGroupsListResponse {
    status: string;
    groups: GroupsData[];
    error?: string;
    message?: string;
  }
    export interface GroupData{
                     _id: {
                         $oid: string
                     },
                     iid: string,
                     user_id: {
                         $oid: string
                     },
                     name: string,
                     status: string,
                     perms: [],
                     time_created: {
                         $date: number
                     },
                     time_updated: {
                         $date: number
                     },
                     public: null,
                     recipients: [
                         {
                            _id: {
                                 $oid: string
                             },
                             first_name:string,
                             last_name: string,
                             cell_phone: string,
                             cellphone_verify: boolean,
                             cellphone_verify_time: null,
                             cellphone_reverify: boolean,
                             email_comm: boolean,
                             sms_comm: boolean,
                             type: string,
                             profile: {
                                 dept: string,
                                 iid: string,
                                 title: string,
                                 pager_number :string,
                                 iname: string,
                                 ishort: string
                             },
                             date_last_login: {
                                 $date: number
                             },
                             image_id:string,
                             status: {
                                 s: string,
                                 role_notify: [
                                     {
                                         uid: {
                                             $oid: string
                                         },
                                         stype: [
                                            string
                                         ],
                                         sname: [
                                             string
                                         ],
                                         date: {
                                             $date: number
                                         },
                                         event: string,
                                         first_name: string,
                                         last_name: string,
                                         admin_first_name: string,
                                         admin_last_name: string
                                     }
                                 ],
                                 away_message_mode : string,
                                  is_signed_out : boolean
                             },
                              flag_active : boolean
                         }
                     ],
                      is_writable : boolean,
                      is_group_readable : boolean,
                      user : {
                          _id : {
                              $oid :  string 
                         },
                          first_name : string,
                          last_name : string,
                          cell_phone : null,
                          cellphone_verify : boolean,
                          cellphone_verify_time : null,
                          cellphone_reverify : boolean,
                          email_comm : boolean,
                          sms_comm : boolean,
                          type : string,
                          profile : {
                              dept : string,
                              iid : string,
                              title : string,
                              pager_number : string,
                              iname : string ,
                              ishort : string
                         },
                          date_last_login : {
                              $date : number
                         },
                         image_id: string,
                         status: {
                              s : string,
                              is_signed_out : boolean
                         },
                          flag_active : boolean
                     },
                      recipient_ids: [
                         {
                              $oid :string
                         }
                     ]
     
         
    }

    export interface GroupsData{
        edit?:boolean
        _id: {
            $oid: string
        },
        iid: string,
        user_id: {
            $oid: string
        },
        name: string,
        status: string,
        perms: [],
        time_created: {
            $date: number
        },
        time_updated: {
            $date: number
        },
        public: null,
        recipients: [
            {
               _id: {
                    $oid: string
                },
                first_name:string,
                last_name: string,
                cell_phone: string,
                cellphone_verify: boolean,
                cellphone_verify_time: null,
                cellphone_reverify: boolean,
                email_comm: boolean,
                sms_comm: boolean,
                type: string,
                profile: {
                    dept: string,
                    iid: string,
                    title: string,
                    pager_number :string,
                    iname: string,
                    ishort: string
                },
                date_last_login: {
                    $date: number
                },
                image_id:string,
                status: {
                    s: string,
                    role_notify: [
                        {
                            uid: {
                                $oid: string
                            },
                            stype: [
                               string
                            ],
                            sname: [
                                string
                            ],
                            date: {
                                $date: number
                            },
                            event: string,
                            first_name: string,
                            last_name: string,
                            admin_first_name: string,
                            admin_last_name: string
                        }
                    ],
                    away_message_mode : string,
                     is_signed_out : boolean
                },
                 flag_active : boolean
            }
        ],
         is_writable : boolean,
         is_group_readable : boolean,
         user : {
             _id : {
                 $oid :  string 
            },
             first_name : string,
             last_name : string,
             cell_phone : null,
             cellphone_verify : boolean,
             cellphone_verify_time : null,
             cellphone_reverify : boolean,
             email_comm : boolean,
             sms_comm : boolean,
             type : string,
             profile : {
                 dept : string,
                 iid : string,
                 title : string,
                 pager_number : string,
                 iname : string ,
                 ishort : string
            },
             date_last_login : {
                 $date : number
            },
            image_id: string,
            status: {
                 s : string,
                 is_signed_out : boolean
            },
             flag_active : boolean
        },
         recipient_ids: [
            {
                 $oid :string
            }
        ]


}