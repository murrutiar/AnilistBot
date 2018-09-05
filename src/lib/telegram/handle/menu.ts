import moment from 'moment';
import { IMenuContext, IMenuLanguageContext, IMenuNotifyContext, IMenuTimeContext, IMenuUserContext } from '.';
import { IDBUserInfo } from '../../database/user';
import { userInfo, userLanguage, userSetNotification, userSetTime } from '../../database/user/user';
import { errorDate } from '../../database/utils';
import { getLanguageCode } from './language';
import { handleLocation } from './location';
import { handleAnime, handleManga } from './media';

const handleTime = async ({ id, user, request, translation }: IMenuTimeContext): Promise<string> => {
    // if ('TIME' === request) {
    //     return translation.t('timeOptions');
    // }
    if ('PERIOD' === request) {
        return translation.t('timePeriodOptions');
    } if ('AM' === request || 'PM' === request) {
        return translation.t('timeHourOptions');
    }

    return userSetTime({ id: user, time: id })
           .then(date => (errorDate !== date) ? translation.t('setHour', { hour: moment(date).hour() }) : translation.t('errorSetHour'))
           .catch(() => translation.t('errorSetHour'));
};

const handleLanguage = async ({ user, request, translation }: IMenuLanguageContext): Promise<string> => {
    // if ('LANGUAGE' === request) {
    //     return translation.t('languageOptions');
    // }

    return userLanguage({ id: user, language: getLanguageCode(request) })
          .then(() => translation.t('setLanguage'))
          .catch(() => translation.t('errorSetLanguage'));
};

const handleNotify = async ({ user, request, translation }: IMenuNotifyContext): Promise<string> => {
    const notify = ('ENABLE' === request) ? true : false ;

    // if ('NOTIFY' === request) {
    //     return translation.t('notifyOptions');
    // }

    return userSetNotification({ id: user, notify })
           .then(() => translation.t('setNotify', { notify: (true === notify) ? translation.t('enabled') : translation.t('disabled') }))
           .catch(() => translation.t('errorNotify'));
};

const handleUser = async ({ user, translation }: IMenuUserContext): Promise<string> => userInfo(user).then(info => {
    const { notify, language, time, timezone } = <IDBUserInfo> info;

    return translation.t('userOptions', {
        time: (null !== time) ? moment(time).hour() : translation.t('timeNotSet'),
        timezone: (null !== timezone) ? timezone : translation.t('timezoneNotSet'),
        notify: (true === notify) ? translation.t('enabled') : translation.t('disabled'),
        language: (null !== language) ? translation.t(language) : translation.t('languageDefault')
    });
}).catch(() => translation.t('errorUserInfo'));

const handleCounter = async ({ user, translation }: IMenuUserContext): Promise<string> => userInfo(user).then(info => {
    const { counter } = <IDBUserInfo> info;

    return translation.t('counterOptions', { counter: (null !== counter) ? counter : translation.t('notAvailable') });
}).catch(() => translation.t('errorUserInfo'));

// export const handleMenu = async ({ id, user, request, translation }: IMenuContext): Promise<string> => {
//     const kind = request.split('-');

//     if ('ANIME' === kind[0]) {
//         return handleAnime({ user, request, translation });
//     } if ('MANGA' === kind[0]) {
//         return handleManga({ user, request, translation });
//     } if ('NOTIFY' === kind[0]) {
//         return handleNotify({ user, request, translation });
//     } if ('TIME' === kind[0]) {
//         return handleTime({ id, user, request, translation });
//     } if ('LOCATION' === kind[0]) {
//         return handleLocation({ request, translation });
//     } if ('LANGUAGE' === kind[0]) {
//         return handleLanguage({ user, request, translation });
//     } if ('MENU' === request) {
//         return translation.t('menuOptions');
//     } if ('ABOUT' === request) {
//         return translation.t('aboutOptions');
//     } if ('GUIDE' === request) {
//         return translation.t('guideOptions');
//     } if ('USER' === request) {
//         return handleUser({ user, translation });
//     } if ('COUNTER' === request) {
//         return handleCounter({ user, translation });
//     } if ('COUNTDOWN' === request) {
//         return translation.t('countdownOptions', { anime: 'foo' });
//     }

//     return translation.t('notAvailable');
// };
