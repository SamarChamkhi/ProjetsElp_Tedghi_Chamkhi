import Browser
import Http
import Html exposing (..)
import Json.Decode as JD

type Model = WordList [String] | Loading | Error

init : () -> (Model, Cmd Msg)
init _ = (Loading, getWordList)

type Msg = GotWordList (Result Http.Error [String])

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
case msg of
GotWordList (Ok words) -> (WordList words, Cmd.none)
GotWordList (Err _) -> (Error, Cmd.none)

view : Model -> Html Msg
view model =
case model of
Loading -> text "Loading..."
Error -> text "An error has occurred"
WordList words ->
ul [] (List.map (\word -> li [] [text word]) words)

subscriptions : Model -> Sub Msg
subscriptions _ = Sub.none

getWordList : Cmd Msg
getWordList =
    Http.get
    { url = "https://perso.liris.cnrs.fr/tristan.roussillon/GuessIt/thousand_words_things_explainer.txt"
    , expect = Http.expectString GotWordList
    }

main =
    Browser.element
    { init = init
    , update = update
    , subscriptions = subscriptions
    , view = view
    }