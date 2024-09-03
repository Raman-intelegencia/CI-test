import { Reference } from "@amsconnect/shared";
import { UserData } from "../../../modals/users-status.model";
import { User } from "apps/admin/src/modals/users.model";

const STATUS_OPTIONS: {
    value: string;
    class: string;
    label: string;
    icon: string;
  }[] = [
    {
      value: "available",
      class: "text-green-500",
      label: "available",
      icon: "check-circle",
    },
    {
      value: "busy",
      class: "text-neutral",
      label: "busy",
      icon: "prohibit",
    },
    {
      value: "off",
      class: "text-gray-600",
      label: "offDuty",
      icon: "minus-circle",
    },
  ];


export class UserStatusHelper {
    public statusOptions = STATUS_OPTIONS;

    public convertUserToUserData(user: User): UserData {
      const userData: UserData = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        cell_phone: user.cell_phone || null, // Default to null if undefined
        cellphone_verify: user.cellphone_verify,
        cellphone_verify_time: user.cellphone_verify_time ? user.cellphone_verify_time.$date : null,
        cellphone_reverify: user.cellphone_reverify,
        popup_msg_last_date: null, // Default or transform as necessary
        email_comm: user.email_comm,
        sms_comm: user.sms_comm,
        first_dnd_popup_time: user.first_dnd_popup_time || null,
        type: user.type,
        profile: {
          dept: user.profile.dept || '',
          iid: user.profile.iid || '',
          title: user.profile.title || '',
          pager_number: user.profile.pager_number || '',
          iname: user.profile.iname || '',
          ishort: user.profile.ishort || '',
        },
        date_last_login: user.date_last_login ? { $date: user.date_last_login.$date } : { $date: 0 },
        image_id: user.image_id,
        status: {
          s: user.status.s,
          role_notify: user.status.role_notify ? user.status.role_notify.map(rn => ({
              uid: rn.uid,
              stype: rn.stype,
              sname: rn.sname,
              date: { $date: rn.date.$date },
              event: rn.event,
              first_name: rn.first_name,
              last_name: rn.last_name,
              admin_first_name: rn.admin_first_name || '',
              admin_last_name: rn.admin_last_name || '',
          })) : [],
          r: user.status.r,
          r_type: user.status.r_type,
          away_message_mode: user.status.away_message_mode,
          is_signed_out: user.status.is_signed_out,
          away_message: user.status.away_message || '',
          c: user.status.c || {ref: '', type: ''}
      },
        flag_active: user.flag_active,
        email: user.email,
        journal_id: user.journal_id,
        has_password: user.has_password,
        is_temp_password: user.is_temp_password,
        is_initial_password: user.is_initial_password,
        admin: user.admin?.map(a => ({ iid: a.iid, iname: a.iname })) ?? [],
        phi_iids: user.phi_iids?.map(p => ({ iid: p.iid, iname: p.iname })) ?? [],
        properties: {
          seen_coach_mark_hint_archive_all: user.properties?.['seen_coach_mark_hint_archive_all'] ?? '',
          seen_coach_mark_scheduling_checkbox: user.properties?.['seen_coach_mark_scheduling_checkbox'] ?? '',
          seen_coach_mark_mypatients_add: user.properties?.['seen_coach_mark_mypatients_add'] ?? '',
          inbox_sort: user.properties?.['inbox_sort'] ?? '',
          pref_mute_pager: user.properties?.['pref_mute_pager'] ?? '',
        },
        auto_schedule: user.auto_schedule,
        inst_migrating: user.inst_migrating,
        uid: user.uid,
        has_pin: user.has_pin,
        num_good_logins: user.num_good_logins,
        num_bad_logins: user.num_bad_logins,
        time_created: user.time_created ? { $date: user.time_created.$date } : { $date: 0 },
        site: user.site || {}, 
        can_send_activation_email: user.can_send_activation_email,
        wowos: user.wowos || {},
        legal_agreement: user.legal_agreement,
        time_last_login: user.time_last_login ? { $date: user.time_last_login.$date } : { $date: 0 },
        time_password_set: user.time_password_set ? { $date: user.time_password_set.$date } : { $date: 0 },
        notification_token: user.notification_token ? user.notification_token.token : null,
      };
    
      return userData;
    }
    

}