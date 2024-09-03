export const threadtypes = [
    {
        "id": "peer_to_peer",
        "parent_iid": "",
        "short_name": "Peer to Peer",
        "name": "Peer to Peer messages",
        "is_locked": false
    },
    {
        "id": "broadcast",
        "parent_iid": "",
        "short_name": "Broadcast",
        "name": "Broadcast messages",
        "is_locked": false
    },
    {
        "id": "external",
        "parent_iid": "",
        "short_name": "External",
        "name": "External messages",
        "is_locked": false
    }
]

export const messageType =  [
    {
        "id": "service",
        "parent_iid": "",
        "short_name": "Service",
        "name": "Service Messages",
        "is_locked": false
    },
    {
        "id": "messenging",
        "parent_iid": "",
        "short_name": "Messenging group",
        "name": "Messenging Group Messages",
        "is_locked": false
    },
    {
        "id": "pager",
        "parent_iid": "",
        "short_name": "Pager",
        "name": "Pager Messages",
        "is_locked": false
    },
    {
        "id": "individual",
        "parent_iid": "",
        "short_name": "Individual",
        "name": "Individual Messages",
        "is_locked": false
    }
  ]

  export enum IntituteReport{
    msg_content ="msg_content",
    peer_to_peer="peer_to_peer",
    mapped_service="mapped_service",
    service="service",
    institution_services_report = "institution_services"
    
  }