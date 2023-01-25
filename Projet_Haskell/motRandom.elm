module Test7 exposing (..)


import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)
import Http
import Random
import Array
import String exposing (String)

type alias Char = 
    { text: String }

type alias Flags = 
    {  }


type alias Model =
    { selected : Maybe String
    , list: List String 
    }


initialModel : Model
initialModel =
    { selected = Nothing
    , list = []
    }


type Msg
    = FindRandom
    | RandomNumber Int
    | GotText (Result Http.Error String)


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        FindRandom ->
            (model, Random.generate RandomNumber (Random.int 0 (List.length model.list - 1)))
        RandomNumber rn ->
            let
                selected = Array.fromList model.list
                    |> Array.get rn
            in
                ({ model | selected = selected }, Cmd.none)
        GotText result ->
          case result of
            Ok fullText ->
              ({ model | list = textToList fullText}, Cmd.none)
            Err _ ->
              (model, Cmd.none)


renderText : Maybe String -> Html Msg
renderText selected =
    case selected of 
        Just str ->
            text str
        Nothing ->
            text "Please click on Random Button"


textToList : String -> List String
textToList msg =
    String.words msg


view : Model -> Html Msg
view model =
    div []
        [ button [ onClick FindRandom ] [ text "Random" ]
        , div [] [ (renderText model.selected) ]
        ]
        
init : Flags -> (Model, Cmd Msg)
init flags =
    ( initialModel, Http.get
      { url = "http://localhost:8000/Mots/words.txt"
      , expect = Http.expectString GotText
      }
    )


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = always Sub.none
        }