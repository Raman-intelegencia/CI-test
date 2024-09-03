import { environment } from "../../../../../libs/shared/src/lib/config/environment";

const Attachment = ({ attachments, thread_id }) => (
  <img src={`${environment.API_HOST}/external/attachment_preview/${thread_id}/${attachments}`} alt="" />
);

export default Attachment;


