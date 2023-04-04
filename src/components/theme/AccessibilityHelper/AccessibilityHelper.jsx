import React from 'react';
import { Button } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';
import { useSelector } from 'react-redux';

import icon from './icons/readspeaker.svg';

import './rs.less';

const customerId = '10194';

function addRs() {
  var oHead = document.getElementsByTagName('HEAD').item(0);
  var oScript = document.createElement('script');
  oScript.type = 'text/javascript';
  oScript.src = `//cdn-eu.readspeaker.com/script/${customerId}/webReader/webReader.js`;
  oScript.id = 'rs_req_Init';
  oHead.appendChild(oScript);

  oScript.onload = function () {
    console.log('Script has now loaded, initializing ReadSpeaker!');
    window.ReadSpeaker.init();
  };
}

export default function AccessibilityHelper(props) {
  React.useEffect(() => {
    if (!window.rsConf) {
      window.rsConf = {
        params: `//cdn-eu.readspeaker.com/script/${customerId}/webReader/webReader.js?pids=wr`,
      };
      addRs();
    }
  }, []);

  const currentLang = useSelector((state) => state.intl.locale);

  const [show, setShow] = React.useState(false);

  return (
    <>
      <Button
        icon={<Icon name={icon} ariaRole="button" size="24px" />}
        onClick={() => setShow(!show)}
      />

      {show ? (
        <div id="readspeaker_button1" className="rs_skip rsbtn rs_preserve">
          <a
            rel="nofollow"
            className="rsbtn_play"
            title="Listen to this page using ReadSpeaker"
            href={`https://app-eu.readspeaker.com/cgi-bin/rsent?customerid=${customerId}&amp;lang=${currentLang}&amp;readclass=pure-u-md-3-4&amp;url=`}
          >
            <span className="rsbtn_left rsimg rspart">
              <span className="rsbtn_text">
                <span>Listen</span>
              </span>
            </span>
            <span className="rsbtn_right rsimg rsplay rspart"></span>
          </a>
        </div>
      ) : null}
    </>
  );
}

//  <Popup
//    content={intl.formatMessage(messages.underConstruction)}
//    trigger={}
//  />
