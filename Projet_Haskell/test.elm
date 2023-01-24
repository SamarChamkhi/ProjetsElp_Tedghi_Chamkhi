module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (style)
import Html.Events exposing (..)
import Http
import Json.Decode exposing (Decoder, map4, field, int, string)
import File
import Random

-- MODEL

type Model
    = Failure
    | Loading
    | Success Word

type alias Word =
    { word : String
    , definition : String
    , synonyms : String
    }

init : () -> (Model, Cmd Msg)
init _ =
    (Loading, getRandomWordFromFile)

-- UPDATE

type Msg
    = MorePlease
    | GotWord (Result Http.Error Word)
    | GotFile (Result Http.Error String)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        MorePlease ->
            (Loading, getRandomWordFromFile)

        GotWord result ->
            case result of
                Ok word ->
                    (Success word, Cmd.none)

                Err _ ->
                    (Failure, Cmd.none)

        GotFile result ->
            case result of
                Ok contents ->
                    let
                        words = String.split " " contents
                        word = Random.generate (Random.int 0 (List.length words - 1))
                    in
                    (Loading, Http.get { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ (List.head (List.drop word words)) , expect = Http.expectJson GotWord wordDecoder })
                Err _ ->
                    (Failure, Cmd.none)

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none

-- VIEW

view : Model -> Html Msg
view model =
    div []
        [ h2 [] [ text "Random Word" ]
        , viewWord model
        ]

viewWord : Model -> Html Msg
viewWord model =
    case model of
        Failure ->
            div []
                [ text "I could not load a random word for some reason. "                , button [ onClick MorePlease ] [ text "Try Again!" ]
                ]

        Loading ->
            text "Loading..."

        Success word ->
            div []
                [ button [ onClick MorePlease, style "display" "block" ] [ text "More Please!" ]
                , div [] [ text word.word ]
                , p [ style "text-align" "right" ]
                    [ text "— "                    , cite [] [ text word.synonyms ]
                    , text ("mot:"++word++" definition : " ++ word.definition ++ " ")
                    ]
                ]

-- FILE READING

getRandomWordFromFile : Cmd Msg
getRandomWordFromFile =
    File.read "words.txt" GotFile

-- HTTP

wordDecoder : Decoder Word
wordDecoder =
    map4 Word
        (field "word" string)
        (field "synonyms" string)
        (field "definition" string)

main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }
