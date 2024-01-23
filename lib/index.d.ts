declare module 'react-autocomplete-input' {
    import React, { ComponentType, KeyboardEvent, FocusEventHandler } from 'react';
  
    type AutocompleteTextFieldPropsGeneral = {
      Component?: string | ComponentType<any>;
      defaultValue?: string;
      disabled?: boolean;
      maxOptions?: number;
      onBlur?: FocusEventHandler<HTMLTextAreaElement>;
      onChange?: (value: string) => void;
      onKeyDown?: (event: KeyboardEvent) => void;
      onRequestOptions?: (value: string) => void;
      onSelect?: (value: string) => void;
      changeOnSelect?: (trigger: string, slug: string) => string;
      regex?: string;
      matchAny?: boolean;
      minChars?: number;
      requestOnlyIfNoOptions?: boolean;
      spaceRemovers?: string[];
      spacer?: string;
      value?: string | null;
      offsetX?: number;
      offsetY?: number;
      passThroughEnter?: boolean;
      passThroughTab?: boolean;
    } & JSX.IntrinsicAttributes & InputHTMLAttributes<HTMLTextAreaElement>;
  
    export type AutocompleteTextFieldProps =
      | ({
          options: string[];
          trigger: string;
        } & AutocompleteTextFieldPropsGeneral)
      | ({
          options: { [key: string]: string[] };
          trigger: string[];
        } & AutocompleteTextFieldPropsGeneral);
  
    /**
     * AutocompleteTextField
     * @param options - An array of strings or an object with keys as triggers and values as options
     * @param trigger - If options has keys, this should be an array of triggers
     */
    export default class AutocompleteTextField extends React.Component<AutocompleteTextFieldProps> {}
  }
  
