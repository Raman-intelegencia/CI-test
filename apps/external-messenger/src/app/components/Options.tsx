import './Options.scss';
import { environment } from '../../../../../libs/shared/src/lib/config/environment';
const Options = ({ sender, onLeaveThread, onOptionsClose }) => (
  <div className="options">
    <h1 className="options__header">Options</h1>
    <div className="options__section">
      <p>
        If you cancel this conversation, the link you received will be
        deactivated and you will no longer have access to the messages contained
        in the conversation. {sender} will be notified that you have left, and
        will be unable to send more messages.
      </p>
      <p>
        <button
          type="button"
          className="options__button options__button--link options__button--cancel"
          onClick={onLeaveThread}
        >
          Cancel this conversation
        </button>
      </p>
    </div>
    <div className="options__section">
      <p>
        Need help?{' '}
        <a href={`mailto:${environment.SUPPORT_EMAIL}`}>Contact support</a>.
      </p>
      <p>
        By viewing this conversation, you accept our{' '}
        <a href="https://api.amsconnectapp.com/legal/agreement/amsconnect/tos/latest">
          Terms of Service
        </a>
        .
      </p>
      <p>
        <button
          type="button"
          className="options__button options__button--link options__button--optionsclose"
          onClick={onOptionsClose}
        >
          &lt; back
        </button>
      </p>
    </div>
  </div>
);

export default Options;

