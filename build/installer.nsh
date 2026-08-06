!macro customInit
  ${if} ${isUpdated}
    SetOutPath "$TEMP"
    IfFileExists "$INSTDIR\plugins" 0 +2
      Rename "$INSTDIR\plugins" "$TEMP\freedeck_plugins_backup"
      
    IfFileExists "$INSTDIR\user-data" 0 +2
      Rename "$INSTDIR\user-data" "$TEMP\freedeck_userdata_backup"

    IfFileExists "$INSTDIR\src\configs" 0 +2
      Rename "$INSTDIR\src\configs" "$TEMP\freedeck_configs_backup"
  ${endIf}
!macroend

!macro customInstall
  ${if} ${isUpdated}
    IfFileExists "$TEMP\freedeck_plugins_backup" 0 +2
      Rename "$TEMP\freedeck_plugins_backup" "$INSTDIR\plugins"
      
    IfFileExists "$TEMP\freedeck_userdata_backup" 0 +2
      Rename "$TEMP\freedeck_userdata_backup" "$INSTDIR\user-data"

    IfFileExists "$TEMP\freedeck_configs_backup" 0 +2
      Rename "$TEMP\freedeck_configs_backup" "$INSTDIR\src\configs"
  ${endIf}
!macroend