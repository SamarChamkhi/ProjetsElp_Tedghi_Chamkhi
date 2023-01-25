import Html exposing (..)
import File

main =
    File.read "words.txt" GotFile

type Msg 
    = GotFile (Result File.Error String)

view : Model -> Html Msg
view model =
    case model of
        Loading -> text "Loading..."
        Failure -> text "An error occured"
        Success words ->
            ul [] (List.map (\word -> li [] [text word]) words)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        GotFile (Ok content) ->
            let
                words = String.split "\n" content
            in
            (Success words, Cmd.none)
        GotFile (Err _) ->
            (Failure, Cmd.none)

init : () -> (Model, Cmd Msg)
init _ =
    (Loading, getRandomWordFromFile)

subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none

