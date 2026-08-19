!macro customRemoveFiles
  ${if} ${isUpdated}
  ${else}
    RMDir /r $INSTDIR
  ${endIf}
!macroend