# @captchafox/react-native

[![NPM version](https://img.shields.io/npm/v/@captchafox/react-native.svg)](https://www.npmjs.com/package/@captchafox/react-native)

## Installation

Install the library using your prefered package manager

```sh
npm install @captchafox/react-native
```

```sh
yarn add @captchafox/react-native
```

```sh
pnpm add @captchafox/react-native
```

_Follow the steps 1 and 2 of the [`react-native-webview` Getting Started Guide](https://github.com/react-native-community/react-native-webview/blob/master/docs/Getting-Started.md)._

## Usage

```tsx
import React, { useRef } from 'react';
import { View, Button } from 'react-native';

import { CaptchaFoxModal, CaptchaFoxModalRef } from '@captchafox/react-native';

function Example() {
  const captchaRef = useRef<CaptchaFoxModalRef>(null);

  const submit = () => {
    captchaRef?.current?.show();
  }

  const onVerify = (token) => {
    console.log('Verified:', token);
  }

  const onError = (error) => {
    console.error('Error:', error)
  }

  return (
    <View>
      <CaptchaFoxModal
        ref={captchaRef}
        baseUrl="https://YOUR_DOMAIN"
        siteKey="YOUR_SITE_KEY"
        onVerify={onVerify}
        onError={onError}
      />
      <Button
        title="Submit"
        onPress={submit}
      />
    </View>
  );
}
```

For more details, see the [Example Project](https://github.com/CaptchaFox/react-native-captchafox/blob/main/example/src/App.tsx).

### Props

| **Prop**         | **Type**                  | **Description**                                                                 | **Required** |
| ---------------- | ------------------------- | ------------------------------------------------------------------------------- | ------------ |
| siteKey          | `string`                  | The sitekey for the widget                                                      | ✅            |
| baseUrl          | `string`                  | The base URL that is used for the WebView.                                      | ✅            |
| lang             | `string`                  | The language the widget should display. Defaults to automatically detecting it. |              |
| mode             | `inline\|popup\|hidden`   | The mode the widget should be displayed in .                                    |              |
| theme            | `light` &#124; **`dark`** | The theme of the widget. Defaults to light.                                     |              |
| backdropColor    | `string`                  | Color of the modal backdrop.                                                    |              |
| modalStyle       | `Style`                   | Custom modal style.                                                             |              |
| loadingComponent | `ReactNode`               | Custom modal loading indicator.                                                 |              |
| headerComponent  | `ReactNode`               | Custom modal header.                                                            |              |
| footerComponent  | `ReactNode`               | Custom modal footer.                                                            |              |
| onVerify         | `function`                | Called with the response token after successful verification.                   |              |
| onFail           | `function`                | Called after unsuccessful verification.                                         |              |
| onError          | `function`                | Called when an error occured.                                                   |              |
| onExpire         | `function`                | Called when the challenge expires.                                              |              |
| onClose          | `function`                | Called when the challenge was closed.                                           |              |
| onError          | `function`                | Called when an error occured.                                                   |              |
| onLoad           | `function`                | Called after the widget has been loaded.                                        |              |

### Methods

| Name | Type       | Description                |
| ---- | ---------- | -------------------------- |
| show | `function` | Show the CaptchaFox Modal. |
| hide | `function` | Hide the CaptchaFox Modal. |

## Customizing

The package exports the base `CaptchaFox` component to allow using it directly or creating custom modal screens. This base component is used in the `CaptchaFoxModal` with a React Native Modal around it.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.
